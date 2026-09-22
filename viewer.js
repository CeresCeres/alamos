/* One gallery per dialog session; the document keeps its exact reading position. */
(() => {
  const viewer = document.querySelector('#viewer');
  const stage = document.querySelector('#viewer-stage');
  const image = document.querySelector('#viewer-img');
  const zoom = document.querySelector('#zoom');
  const previous = document.querySelector('#viewer-prev');
  const next = document.querySelector('#viewer-next');
  const count = document.querySelector('#viewer-count');
  const status = document.querySelector('#viewer-status');
  const retry = document.querySelector('#viewer-retry');
  let items = [], index = 0, ticket = 0, returnFocus, returnY = 0, returnX = 0, touch, drag;
  const source = button => button.dataset.imageSrc || `assets/${button.dataset.image}-detail.webp`;

  function fit() {
    stage.classList.remove('zoomed', 'dragging');
    zoom.textContent = '放大'; zoom.setAttribute('aria-pressed', 'false');
    stage.scrollTop = stage.scrollLeft = 0;
  }
  function prefetch() {
    const connection = navigator.connection;
    if (items.length < 2 || connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '')) return;
    const preload = new Image(); preload.src = items[(index + 1) % items.length].src;
  }
  async function showImage(n) {
    index = (n + items.length) % items.length;
    const currentTicket = ++ticket, item = items[index];
    fit(); zoom.disabled = true; stage.setAttribute('aria-busy', 'true');
    status.textContent = '正在载入…'; status.hidden = false; retry.hidden = true;
    count.textContent = `${String(index + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
    previous.disabled = next.disabled = items.length < 2;
    document.querySelector('#viewer-title').textContent = item.title || '公开资料';
    document.querySelector('#original').href = item.src;
    const candidate = new Image(); candidate.src = item.src;
    try {
      await candidate.decode();
      if (currentTicket !== ticket || !viewer.open) return;
      image.src = item.src; image.alt = item.title || `公开资料 ${index + 1}`;
      status.hidden = true; zoom.disabled = false; stage.setAttribute('aria-busy', 'false');
      prefetch();
    } catch {
      if (currentTicket !== ticket || !viewer.open) return;
      status.textContent = '图片暂时未能载入'; retry.hidden = false;
      stage.setAttribute('aria-busy', 'false'); image.removeAttribute('src');
    }
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-image],[data-image-src]');
    if (!button || viewer.open) return;
    returnFocus = button; returnY = scrollY; returnX = scrollX;
    const group = button.closest('.library-grid');
    const buttons = group ? [...group.querySelectorAll('[data-image],[data-image-src]')] : [button];
    items = buttons.map(b => ({src:source(b), title:b.dataset.title || ''}));
    document.body.classList.add('modal-open');
    viewer.showModal(); showImage(buttons.indexOf(button));
    document.querySelector('#close-viewer').focus({preventScroll:true});
  });
  previous.addEventListener('click', () => showImage(index - 1));
  next.addEventListener('click', () => showImage(index + 1));
  retry.addEventListener('click', () => showImage(index));
  document.querySelector('#close-viewer').addEventListener('click', () => viewer.close());
  viewer.addEventListener('close', () => {
    ++ticket; document.body.classList.remove('modal-open');
    image.removeAttribute('src'); fit(); touch = drag = null;
    scrollTo({left:returnX, top:returnY, behavior:'instant'});
    if (returnFocus?.isConnected) returnFocus.focus({preventScroll:true});
  });
  viewer.addEventListener('keydown', event => {
    if (stage.classList.contains('zoomed') || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); if (items.length > 1) showImage(index + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  zoom.addEventListener('click', () => {
    const enlarged = stage.classList.toggle('zoomed');
    zoom.textContent = enlarged ? '适应屏幕' : '放大'; zoom.setAttribute('aria-pressed', String(enlarged));
    if (!enlarged) fit();
  });
  image.addEventListener('dblclick', () => { if (!zoom.disabled) zoom.click(); });
  image.addEventListener('dragstart', event => event.preventDefault());
  stage.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0 || !stage.classList.contains('zoomed')) return;
    drag = {x:event.clientX, y:event.clientY, left:stage.scrollLeft, top:stage.scrollTop};
    stage.setPointerCapture(event.pointerId); stage.classList.add('dragging'); event.preventDefault();
  });
  stage.addEventListener('pointermove', event => {
    if (!drag) return;
    stage.scrollLeft = drag.left - event.clientX + drag.x; stage.scrollTop = drag.top - event.clientY + drag.y;
  });
  const stopDrag = () => { drag = null; stage.classList.remove('dragging'); };
  stage.addEventListener('pointerup', stopDrag); stage.addEventListener('pointercancel', stopDrag);
  stage.addEventListener('touchstart', event => {
    touch = event.touches.length === 1 && !stage.classList.contains('zoomed') ? {x:event.touches[0].clientX, y:event.touches[0].clientY} : null;
  }, {passive:true});
  stage.addEventListener('touchmove', event => { if (event.touches.length > 1) touch = null; }, {passive:true});
  stage.addEventListener('touchcancel', () => { touch = null; }, {passive:true});
  stage.addEventListener('touchend', event => {
    if (!touch || event.touches.length || items.length < 2) return;
    const dx = event.changedTouches[0].clientX - touch.x, dy = event.changedTouches[0].clientY - touch.y;
    touch = null;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) showImage(index + (dx < 0 ? 1 : -1));
  }, {passive:true});
})();
