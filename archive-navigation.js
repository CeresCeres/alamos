/* A compact reader dock, shown only after the original archive directory scrolls away. */
(() => {
  const section = document.querySelector('.personnel');
  const picker = document.querySelector('.roster-picker');
  const dock = document.querySelector('#archive-dock');
  const dialog = document.querySelector('#archive-switcher');
  const open = document.querySelector('#open-archive-switcher');
  const groups = document.querySelector('#switcher-factions');
  const records = document.querySelector('#switcher-records');
  let draftFaction = factionId, selectedRecord = false, frame = 0;

  function updateDock() {
    frame = 0;
    const bounds = section.getBoundingClientRect();
    const visible = picker.getBoundingClientRect().bottom < 0 && bounds.bottom > 160 && bounds.top < 0;
    dock.hidden = !visible;
    const person = data.people.find(p => p.id === personId);
    const shownName = panel.querySelector('.person-copy h3')?.textContent;
    const name = shownName || (person?.reserved ? '档案未公开' : person?.name) || '人物档案';
    const label = dock.querySelector('strong'); label.textContent = name; label.title = name;
  }
  const queue = () => { if (!frame) frame = requestAnimationFrame(updateDock); };
  addEventListener('scroll', queue, {passive:true}); addEventListener('resize', queue, {passive:true});
  new ResizeObserver(queue).observe(section);
  new MutationObserver(queue).observe(panel, {childList:true});

  function renderMenu() {
    groups.innerHTML = data.factions.map(f => `<button type="button" data-switch-faction="${esc(f.id)}" aria-pressed="${f.id === draftFaction}">${f.logo ? `<img src="${esc(f.logo)}" alt="">` : ''}<span>${esc(f.name)}</span></button>`).join('');
    const faction = data.factions.find(f => f.id === draftFaction);
    records.innerHTML = data.people.filter(p => p.faction === draftFaction).map((p, index) => {
      const logo = p.identities?.[0]?.logo ?? p.logo ?? faction.logo;
      return `<button type="button" data-switch-person="${esc(p.id)}" aria-pressed="${p.id === personId}" class="${p.reserved ? 'switcher-reserved' : ''}">${logo && !p.reserved ? `<img src="${esc(logo)}" alt="">` : '<span class="switcher-mark" aria-hidden="true">＋</span>'}<span>${esc(p.reserved ? '未公开档案 ' + String(index + 1).padStart(2,'0') : p.name)}</span><b aria-hidden="true">${p.id === personId ? '●' : '↗'}</b></button>`;
    }).join('');
  }
  open.addEventListener('click', () => {
    draftFaction = factionId; selectedRecord = false; renderMenu();
    document.body.classList.add('archive-switcher-open');
    open.setAttribute('aria-expanded', 'true'); dialog.showModal();
  });
  groups.addEventListener('click', event => {
    const button = event.target.closest('[data-switch-faction]'); if (!button) return;
    draftFaction = button.dataset.switchFaction; renderMenu();
    groups.querySelector(`[data-switch-faction="${draftFaction}"]`).focus({preventScroll:true});
  });
  records.addEventListener('click', event => {
    const button = event.target.closest('[data-switch-person]'); if (!button) return;
    const person = data.people.find(p => p.id === button.dataset.switchPerson);
    remembered[person.faction] = person.id; chooseFaction(person.faction);
    selectedRecord = true; dialog.close();
    panel.setAttribute('tabindex', '-1'); panel.focus({preventScroll:true});
    panel.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block:'start'});
  });
  document.querySelector('#close-archive-switcher').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    document.body.classList.remove('archive-switcher-open'); open.setAttribute('aria-expanded', 'false');
    if (!selectedRecord && !dock.hidden) open.focus({preventScroll:true}); queue();
  });
  updateDock();
})();
