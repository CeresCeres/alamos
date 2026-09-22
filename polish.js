// Limited to decorative backgrounds; no pointer or scroll hijacking.
const motionPreference=matchMedia('(prefers-reduced-motion: reduce)'),pointerPreference=matchMedia('(hover:hover) and (pointer:fine) and (min-width:761px)');
for(const section of document.querySelectorAll('.hero,.region')){
 let x=0,y=0,tx=0,ty=0,frame=0,visible=true;
 const driftWidth=section.matches('.hero')?4:14,driftHeight=section.matches('.hero')?3:10;
 const allowed=()=>!motionPreference.matches&&pointerPreference.matches&&visible;
 function draw(){frame=0;if(!allowed())return;x+=(tx-x)*.075;y+=(ty-y)*.075;section.style.setProperty('--drift-x',x.toFixed(2)+'px');section.style.setProperty('--drift-y',y.toFixed(2)+'px');if(Math.abs(tx-x)+Math.abs(ty-y)>.025)frame=requestAnimationFrame(draw)}
 function reset(){cancelAnimationFrame(frame);frame=0;x=y=tx=ty=0;section.style.removeProperty('--drift-x');section.style.removeProperty('--drift-y')}
 section.addEventListener('pointermove',e=>{if(!allowed())return;const r=section.getBoundingClientRect();tx=((e.clientX-r.left)/r.width-.5)*driftWidth;ty=((e.clientY-r.top)/r.height-.5)*driftHeight;if(!frame)frame=requestAnimationFrame(draw)},{passive:true});
 section.addEventListener('pointerleave',()=>{tx=ty=0;if(allowed()&&!frame)frame=requestAnimationFrame(draw)});
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible)reset()}).observe(section);
 motionPreference.addEventListener('change',reset);pointerPreference.addEventListener('change',reset);document.addEventListener('visibilitychange',()=>{if(document.hidden)reset()});
}
for(const counter of document.querySelectorAll('#scene-count,#world-count')){
 const sceneButtons=counter.closest('.scene-controls');
 const updateSceneProgress=()=>{const [page,total]=counter.textContent.split('/').map(value=>parseInt(value,10));if(page&&total)sceneButtons.style.setProperty('--scene-progress',page/total*100+'%')};
 new MutationObserver(updateSceneProgress).observe(counter,{childList:true});updateSceneProgress();
}
