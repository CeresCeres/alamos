const imageSizes=window.ALMS_IMAGE_SIZES||{},imagePreviews=window.ALMS_PREVIEWS||{};
function mediaGrid(items){if(!items?.length)return '';return `<section class="archive-album" aria-label="资料图册" aria-roledescription="轮播图"><div class="album-stage"><div class="library-grid">${items.map((i,n)=>{
 const size=imageSizes[i.thumb]||imageSizes[i.detail];
 const previews=imagePreviews[i.detail]||[];
 const sources=[...(imageSizes[i.thumb]?[{src:i.thumb,width:imageSizes[i.thumb][0]}]:[]),...previews];
 const srcset=sources.map(x=>`${esc(x.src)} ${x.width}w`).join(', ');
 const sizes='(max-width:760px) calc(100vw - 68px), (max-width:1100px) 75vw, 800px';
 return `<button class="library-image" data-image-src="${esc(i.detail)}" data-title="" aria-label="查看图片 ${n+1}" ${n?'hidden':''}><span class="library-thumb"><img src="${esc(i.thumb)}" ${srcset?`srcset="${srcset}" sizes="${sizes}"`:''} ${size?`width="${size[0]}" height="${size[1]}"`:''} alt="" loading="${n?'lazy':'eager'}" decoding="async"></span></button>`;
 }).join('')}</div><div class="album-feedback"><span class="album-status" role="status" hidden></span><button class="album-retry" hidden>重试</button></div></div><div class="album-toolbar"><span class="album-hint">点击图片放大</span><div class="album-controls" role="group" aria-label="图册翻页"><button class="album-prev" aria-label="上一张资料" ${items.length<2?'disabled':''}>←</button><span class="album-count" aria-live="polite">01 / ${String(items.length).padStart(2,'0')}</span><button class="album-next" aria-label="下一张资料" ${items.length<2?'disabled':''}>→</button></div></div>${items.length>1?`<div class="album-index" role="group" aria-label="选择资料页">${items.map((i,n)=>`<button data-album-page="${n}" aria-label="第 ${n+1} 张资料" ${n?'':'aria-current="true"'}><img src="${esc(i.thumb)}" alt="" loading="lazy" decoding="async"><span aria-hidden="true">${String(n+1).padStart(2,'0')}</span></button>`).join('')}</div>`:''}</section>`}
const media=window.ALMS_MEDIA;
function attachMedia(){
 const faction=data.factions.find(f=>f.id===factionId);
 const person=data.people.find(p=>p.id===personId),galleryRecord=faction.galleryOnly?faction:(person?.galleryOnly?person:null);
 if(galleryRecord){const target=panel.querySelector('.faction-gallery');if(target&&!target.childElementCount){target.innerHTML=mediaGrid(galleryRecord.gallery);initAlbums(target)}return}
 if(!person)return;
 const shown={...person,...person.identities?.[identityIndex]},target=panel.querySelector('.person-panel');
 if(!target||target.querySelector('.person-supplement')||!shown.gallery?.length)return;
 const gallery=document.createElement('div');gallery.className='person-supplement';gallery.id='person-materials';
 if(shown.sheetOnly){gallery.innerHTML=mediaGrid(shown.gallery)}else{
  const count=shown.gallery.length;
  gallery.innerHTML=`<details class="library-category dossier-entry"><summary><span class="entry-previews" aria-hidden="true">${shown.gallery.slice(0,3).map(i=>`<img src="${esc(i.thumb)}" alt="" loading="lazy">`).join('')}</span><span class="entry-heading">人物资料<span>${count} 张公开图像</span></span><span class="entry-action">展开查阅 <b>＋</b></span></summary><div class="dossier-images"></div></details>`;
  const details=gallery.querySelector('details');
  const load=()=>{if(!details.dataset.loaded){details.querySelector('.dossier-images').innerHTML=mediaGrid(shown.gallery);details.dataset.loaded='true';initAlbums(details)}};
  details.addEventListener('toggle',()=>{if(details.open)load();details.querySelector('.entry-action').innerHTML=details.open?'收起资料 <b>−</b>':'展开查阅 <b>＋</b>';jump.setAttribute('aria-expanded',String(details.open))});
  const jump=document.createElement('button');jump.className='dossier-jump';jump.setAttribute('aria-controls','person-materials');jump.setAttribute('aria-expanded','false');jump.innerHTML=`<span>查看人物资料 <small>${count} 张</small></span><b>↓</b>`;
  jump.addEventListener('click',()=>{load();details.open=true;jump.setAttribute('aria-expanded','true');gallery.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'start'});details.querySelector('summary').focus({preventScroll:true})});
  target.querySelector('.person-copy').append(jump);
 }
 target.append(gallery);initAlbums(gallery);
}
new MutationObserver(attachMedia).observe(panel,{childList:true});attachMedia();
let scene=0,sceneTarget=0,sceneRequest=0;const backdrop=document.querySelector('.region-bg');
function configureSceneImage(img,item){
 const variants=imagePreviews[item.detail]||[];
 img.src=variants[0]?.src||item.detail;
 if(variants.length){img.srcset=variants.map(x=>`${x.src} ${x.width}w`).join(', ');img.sizes='(max-width:760px) 180svh, 100vw'}else{img.removeAttribute('srcset');img.removeAttribute('sizes')}
 img.style.setProperty('--scene-mobile-position',item.mobilePosition||'50% 50%');
}
configureSceneImage(backdrop,media.scenes[0]);
async function changeScene(direction){
 sceneTarget=(sceneTarget+direction+media.scenes.length)%media.scenes.length;const target=sceneTarget,ticket=++sceneRequest;const controls=document.querySelector('.scene-controls');controls.dataset.loading='true';
 const candidate=new Image();configureSceneImage(candidate,media.scenes[target]);
 try{await candidate.decode()}catch{if(ticket===sceneRequest){sceneTarget=scene;controls.dataset.loading='false'}return}
 if(ticket!==sceneRequest)return;
 document.querySelectorAll('.region-old-frame').forEach(el=>el.remove());
 const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
 let old;if(!reduced){old=backdrop.cloneNode();old.removeAttribute('srcset');old.src=backdrop.currentSrc||backdrop.src;old.classList.add('region-old-frame');old.alt='';old.setAttribute('aria-hidden','true');backdrop.after(old)}
 scene=target;configureSceneImage(backdrop,media.scenes[scene]);backdrop.alt='北德文斯克城市影像';
 document.querySelector('#scene-count').textContent=String(scene+1).padStart(2,'0')+' / '+String(media.scenes.length).padStart(2,'0');controls.dataset.loading='false';
 if(old){const fade=old.animate([{opacity:1},{opacity:0}],{duration:420,easing:'ease-out',fill:'forwards'});fade.finished.then(()=>old.remove()).catch(()=>old.remove())}
}

document.querySelector('#scene-prev').addEventListener('click',()=>changeScene(-1));document.querySelector('#scene-next').addEventListener('click',()=>changeScene(1));
document.querySelector('.region').addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();changeScene(-1)}if(e.key==='ArrowRight'){e.preventDefault();changeScene(1)}});
let cityTouch;const city=document.querySelector('.region');city.addEventListener('touchstart',e=>{cityTouch=e.touches.length===1?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null},{passive:true});city.addEventListener('touchmove',e=>{if(e.touches.length>1)cityTouch=null},{passive:true});city.addEventListener('touchcancel',()=>{cityTouch=null},{passive:true});city.addEventListener('touchend',e=>{if(!cityTouch||e.touches.length)return;const dx=e.changedTouches[0].clientX-cityTouch.x,dy=e.changedTouches[0].clientY-cityTouch.y;cityTouch=null;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.5)changeScene(dx<0?1:-1)},{passive:true});
for(const [selector,item] of [['.story-opening',media.decor[0]],['.transmission',media.decor[1]]]){const img=document.createElement('img');configureSceneImage(img,item);img.alt='';img.loading='lazy';img.decoding='async';img.className='ambient-art';document.querySelector(selector).prepend(img)}

document.querySelector("#scene-count").textContent="01 / "+String(media.scenes.length).padStart(2,"0");
