/* Keep the directory and biography in one column without a fixed content height. */
(() => {
 const section=document.querySelector('.personnel');
 const picker=document.querySelector('.roster-picker');
 const panel=document.querySelector('#archive-person');
 const factions=document.querySelector('#faction-tabs');
 if(!section||!picker||!panel) return;
 let frame=0;
 const update=()=>{
  frame=0;
  const next=Math.ceil(picker.getBoundingClientRect().height)+52+'px';
  if(section.style.getPropertyValue('--roster-space')!==next) section.style.setProperty('--roster-space',next);
  const id=factions.querySelector('[aria-selected=true]')?.dataset.faction;
  if(id) section.dataset.faction=id;
 };
 const queue=()=>{if(!frame) frame=requestAnimationFrame(update)};
 new ResizeObserver(queue).observe(picker);
 new MutationObserver(queue).observe(panel,{childList:true});
 new MutationObserver(queue).observe(factions,{childList:true});
 update();
})();
