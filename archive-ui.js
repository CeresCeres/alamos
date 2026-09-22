const data=window.ALMS_ARCHIVE, factionTabs=document.querySelector('#faction-tabs'),personTabs=document.querySelector('#person-tabs'),panel=document.querySelector('#archive-person');let factionId=data.factions[0].id,personId='',identityIndex=0,variantIndex=0;const remembered={};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function renderFactionTabs(){factionTabs.innerHTML=data.factions.map(f=>`<button id="faction-${esc(f.id)}" role="tab" data-faction="${esc(f.id)}" aria-controls="faction-panel" aria-selected="${f.id===factionId}" tabindex="${f.id===factionId?0:-1}">${f.logo?`<img src="${esc(f.logo)}" alt="">`:''}<span>${esc(f.name)}<small>${esc(f.en)}</small></span></button>`).join('');document.querySelector('#faction-panel').setAttribute('aria-labelledby','faction-'+factionId)}
function renderRoster(){
 const f=data.factions.find(x=>x.id===factionId),people=data.people.filter(x=>x.faction===factionId),publicCount=people.filter(x=>!x.reserved).length;
 // A faction keeps one directory layout across public, gallery and reserved records.
 document.querySelector('#faction-panel').dataset.layout=people.some(x=>x.sheetOnly)&&people.every(x=>x.reserved||x.sheetOnly)?'sheet':'split';
 document.querySelector('#faction-description').textContent=f.description||'';
 document.querySelector('#faction-count').textContent=`${publicCount} 份公开 / ${people.length} 个档案位`;
 let picker=document.querySelector('#roster-picker');
 if(!picker){
  picker=document.createElement('div');picker.id='roster-picker';picker.className='roster-picker';
  personTabs.before(picker);
  picker.innerHTML='<div class="roster-heading"><h3 id="roster-title">人物档案</h3><span id="roster-hint"></span></div>';
  picker.append(personTabs);personTabs.setAttribute('aria-labelledby','roster-title');
 }
 picker.hidden=!!f.galleryOnly;personTabs.hidden=!!f.galleryOnly;
 personTabs.dataset.publicCount=publicCount;
 personTabs.dataset.archiveGroup=f.id;
 document.querySelector('#roster-title').textContent=f.id==='linked'?'档案目录':'人物档案';
 document.querySelector('#roster-hint').textContent=`${publicCount} 份公开 · 点击切换`;
 document.querySelector('.faction-intro').hidden=true;
 personTabs.innerHTML=people.map((x,i)=>{
  const selected=x.id===personId,logo=x.identities?.[0]?.logo??x.logo??f.logo;
  return `<button id="tab-${esc(x.id)}" data-person="${esc(x.id)}" role="tab" aria-label="${esc(x.reserved?'未公开档案 '+String(i+1).padStart(2,'0'):x.name)}" aria-selected="${selected}" aria-controls="archive-person" tabindex="${selected?0:-1}" class="person-tab ${x.reserved?'reserved-tab':''}">
   ${!x.reserved&&logo?`<span class="roster-emblem roster-emblem-${esc(x.id)}" aria-hidden="true"><img src="${esc(logo)}" alt="" loading="lazy" decoding="async"></span>`:''}
   <span class="roster-card-copy"><span class="roster-card-index" aria-hidden="true">${String(i+1).padStart(2,'0')}</span><strong>${esc(x.reserved?'未公开':x.name)}</strong><small>${x.reserved?'待公开':selected?'正在查看':'查阅档案'}</small></span>
   <b class="roster-card-arrow" aria-hidden="true">${x.reserved?'＋':selected?'↓':'→'}</b>
  </button>`;
 }).join('');renderPerson();
}
// Keep the backdrop outside the animated record and its expandable content.
const archiveBackdrop=document.createElement('div');
archiveBackdrop.className='archive-backdrop';archiveBackdrop.setAttribute('aria-hidden','true');
const archiveEmblem=document.createElement('img');archiveEmblem.alt='';archiveBackdrop.append(archiveEmblem);
function renderArchiveContent(markup,logo){
 const content=document.createElement('template');content.innerHTML=markup;
 archiveBackdrop.hidden=!logo;
 if(logo&&archiveEmblem.getAttribute('src')!==logo)archiveEmblem.src=logo;
 panel.replaceChildren(archiveBackdrop,content.content);
}
function renderPerson(){const p=data.people.find(x=>x.id===personId),f=data.factions.find(x=>x.id===factionId);panel.setAttribute('aria-labelledby','tab-'+personId);
 const identity=p?.identities?.[identityIndex],v=p?.variants?.[variantIndex],shown={...p,...identity,...v},logo=shown.backgroundLogo||(shown.logo??f.logo);
 if(f.galleryOnly||p?.galleryOnly){renderArchiveContent(`<div class="faction-gallery${logo?' has-backdrop':''}"></div>`,logo);return}
 if(!p){renderArchiveContent('<div class="empty-archive"><h3>暂无公开档案</h3></div>',logo);return}
 if(p.reserved){renderArchiveContent(`<article class="empty-archive"><div class="empty-mark" aria-hidden="true">＋</div><p class="micro">${esc(p.id.toUpperCase())} / UNDISCLOSED</p><h3>档案未公开</h3><p>${esc(f.name)} · 人物情报待公开</p></article>`,logo);return}
 const controls=p.identities?`<div class="record-clue"><button class="outline-link" data-identity="${identityIndex===0?1:0}">${identityIndex===0?'查阅附页 <span>↗</span>':'返回人物记录 <span>↶</span>'}</button></div>`:'';
 const variants=p.variants?.length?`<div class="variant" role="group" aria-label="服装状态">${p.variants.map((x,i)=>`<button data-variant="${i}" class="${i===variantIndex?'active':''}" aria-pressed="${i===variantIndex}">${esc(x.label)}</button>`).join('')}</div>`:'';
 const image=shown.image?`<button class="image-button portrait" data-image-src="${esc(shown.detail||shown.image)}" data-title="${esc(shown.name)} · 公开形象"><img src="${esc(shown.image)}" alt="${esc(shown.name)}立绘"></button>`:'<div class="portrait portrait-pending"><span>立绘情报待公开</span></div>';
 renderArchiveContent(`<article class="person-panel ${p.sheetOnly?"sheet-only":""} ${esc(p.id)} ${identity?'dual-identity':''} ${identityIndex===1?'historical':''}"><div class="person-art">${image}${variants}</div><div class="person-copy"><p class="micro">${esc(identity?.label||'PERSONNEL ARCHIVE')}</p><p class="person-en">${esc(shown.en)}</p><h3>${esc(shown.name)}</h3><div class="affiliation">${logo?`<img src="${esc(logo)}" alt="" width="38" height="38">`:''}<div>${esc(shown.affiliation||f.name)}${shown.affiliationEn?`<small>${esc(shown.affiliationEn)}</small>`:""}</div></div>${String(shown.description||'').split('\n\n').filter(Boolean).map(t=>`<p>${esc(t)}</p>`).join('')}${shown.note?`<p class="identity-note">${esc(shown.note)}</p>`:''}${controls}${shown.organizationLink?`<div class="organization-link"><p class="micro">组织关系</p><div>${esc(shown.organizationLink.parent)}<small>${esc(shown.organizationLink.parentEn)}</small></div><span class="org-arrow">↓ 全资子公司</span><button data-org-faction="${esc(shown.organizationLink.faction)}" data-org-person="${esc(shown.organizationLink.person)}">${esc(shown.organizationLink.child)} <span>↗</span><small>${esc(shown.organizationLink.childEn)}</small></button></div>`:""}${shown.design?`<button class="outline-link" data-image-src="${esc(shown.design)}" data-title="${esc(shown.name)} · 设定资料">查阅设定资料 <span>↗</span></button>`:''}</div></article>`,logo);
}
function chooseFaction(id){factionId=id;const people=data.people.filter(x=>x.faction===id);personId=remembered[id]||people[0]?.id||'';identityIndex=variantIndex=0;renderFactionTabs();renderRoster()}
factionTabs.addEventListener('click',e=>{const b=e.target.closest('[data-faction]');if(b){chooseFaction(b.dataset.faction);document.getElementById('faction-'+factionId).focus({preventScroll:true})}});
personTabs.addEventListener('click',e=>{const b=e.target.closest('[data-person]');if(b){personId=b.dataset.person;remembered[factionId]=personId;identityIndex=variantIndex=0;renderRoster();document.getElementById('tab-'+personId).focus({preventScroll:true})}});
panel.addEventListener('click',e=>{const i=e.target.closest('[data-identity]'),v=e.target.closest('[data-variant]');if(i){identityIndex=Number(i.dataset.identity);renderPerson();panel.querySelector("[data-identity]").focus({preventScroll:true})}if(v){variantIndex=Number(v.dataset.variant);renderPerson();panel.querySelector(`[data-variant="${variantIndex}"]`).focus({preventScroll:true})}});
for(const list of [factionTabs,personTabs])list.addEventListener('keydown',e=>{const tabs=[...list.querySelectorAll('[role=tab]')],i=tabs.indexOf(document.activeElement);if(i<0)return;let n;if(e.key==='ArrowRight')n=(i+1)%tabs.length;if(e.key==='ArrowLeft')n=(i+tabs.length-1)%tabs.length;if(e.key==='Home')n=0;if(e.key==='End')n=tabs.length-1;if(n!==undefined){e.preventDefault();tabs[n].click()}});
chooseFaction(factionId);

panel.addEventListener("click",e=>{const link=e.target.closest("[data-org-faction]");if(link){remembered[link.dataset.orgFaction]=link.dataset.orgPerson;chooseFaction(link.dataset.orgFaction);document.getElementById("tab-"+personId)?.focus({preventScroll:true})}});
