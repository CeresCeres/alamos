/* Compact, manually paged archive albums. Hidden sheets remain in the lightbox group. */
function initAlbums(root) {
  for (const album of root.querySelectorAll('.archive-album:not([data-ready])')) {
    album.dataset.ready = 'true';
    const stage = album.querySelector('.album-stage');
    const sheets = [...album.querySelectorAll('.library-image')];
    const tabs = [...album.querySelectorAll('[data-album-page]')];
    const rail = album.querySelector('.album-index');
    const count = album.querySelector('.album-count');
    const status = album.querySelector('.album-status');
    const retry = album.querySelector('.album-retry');
    let active = 0, target = 0, request = 0, touch, suppressClickUntil = 0;
    async function showPage(n, direction = 1) {
      target = (n + sheets.length) % sheets.length;
      const selected = target, ticket = ++request;
      const next = sheets[selected], img = next.querySelector('img');
      stage.setAttribute('aria-busy', 'true');
      status.textContent = '正在载入…'; status.hidden = false; retry.hidden = true;
      img.loading = 'eager';
      try {
        await img.decode();
        if (ticket !== request || !album.isConnected) return;
        const restoreFocus = sheets.includes(document.activeElement);
        sheets.forEach((sheet, i) => { sheet.hidden = i !== selected; });
        active = selected;
        count.textContent = `${String(active + 1).padStart(2, '0')} / ${String(sheets.length).padStart(2, '0')}`;
        tabs.forEach((tab, i) => i === active ? tab.setAttribute('aria-current', 'true') : tab.removeAttribute('aria-current'));
        const tab = tabs[active];
        if (rail && tab) {
          const start = tab.getBoundingClientRect().left - rail.getBoundingClientRect().left + rail.scrollLeft, end = start + tab.offsetWidth;
          if (start < rail.scrollLeft) rail.scrollLeft = start;
          else if (end > rail.scrollLeft + rail.clientWidth) rail.scrollLeft = end - rail.clientWidth;
        }
        status.hidden = true; stage.setAttribute('aria-busy', 'false');
        if (restoreFocus) next.focus({preventScroll:true});
        if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
          next.getAnimations().forEach(animation => animation.cancel());
          next.animate([{opacity:.45, transform:`translateX(${direction * 10}px)`},{opacity:1, transform:'translateX(0)'}], {duration:180, easing:'ease-out'});
        }
      } catch {
        if (ticket !== request || !album.isConnected) return;
        status.textContent = '这张图片暂未载入'; retry.hidden = false;
        stage.setAttribute('aria-busy', 'false');
      }
    }
    const turn = delta => { if (sheets.length > 1) showPage(target + delta, delta); };
    album.querySelector('.album-prev').addEventListener('click', () => turn(-1));
    album.querySelector('.album-next').addEventListener('click', () => turn(1));
    retry.addEventListener('click', () => showPage(target));
    tabs.forEach((tab, i) => tab.addEventListener('click', () => showPage(i, i < active ? -1 : 1)));
    album.addEventListener('keydown', event => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) {
        event.preventDefault(); event.stopPropagation();
        if (event.key === 'Home') showPage(0, -1);
        else if (event.key === 'End') showPage(sheets.length - 1);
        else turn(event.key === 'ArrowRight' ? 1 : -1);
      }
    });
    stage.addEventListener('touchstart', event => {
      touch = event.touches.length === 1 ? {x:event.touches[0].clientX, y:event.touches[0].clientY} : null;
    }, {passive:true});
    stage.addEventListener('touchmove', event => { if (event.touches.length > 1) touch = null; }, {passive:true});
    stage.addEventListener('touchcancel', () => { touch = null; }, {passive:true});
    stage.addEventListener('touchend', event => {
      if (!touch || event.touches.length) return;
      const dx = event.changedTouches[0].clientX - touch.x, dy = event.changedTouches[0].clientY - touch.y;
      touch = null;
      if (sheets.length > 1 && Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        suppressClickUntil = Date.now() + 500; turn(dx < 0 ? 1 : -1);
      }
    }, {passive:true});
    stage.addEventListener('click', event => {
      if (Date.now() < suppressClickUntil) { event.preventDefault(); event.stopPropagation(); }
    }, true);
    stage.addEventListener('dragstart', event => event.preventDefault());
    showPage(0);
  }
}
