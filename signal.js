/* Decorative marks derive from ALMS's cold industrial setting; no extra navigation or lore. */
(() => {
 const add = (selector, className, content = '') => {
  const target = document.querySelector(selector);
  if (!target) return;
  const el = document.createElement('div'); el.className = `signal-ornament ${className}`;
  el.setAttribute('aria-hidden', 'true'); el.innerHTML = content; target.append(el); return el;
 };
 const orbit = `<svg viewBox="0 0 600 600" focusable="false"><circle cx="300" cy="300" r="246"/><circle cx="300" cy="300" r="224" stroke-dasharray="1 17"/><path d="M300 24v55m0 442v55M24 300h55m442 0h55M126 126l30 30m288 288 30 30m0-348-30 30M156 444l-30 30"/><path d="M300 104 496 300 300 496 104 300Z" opacity=".5"/><circle cx="300" cy="54" r="5" fill="currentColor" stroke="none"/><path class="orbit-accent" d="M62 363A246 246 0 0 1 62 237M538 237A246 246 0 0 1 538 363"/></svg>`;
 add('.hero','signal-corners');
 add('.hero','signal-stripes','<i></i><i></i><i></i>');
 add('.story-opening','signal-orbit',orbit);
 add('.story-opening','signal-chapter','01');
 add('.region','signal-survey','<i class="survey-track"></i><i class="survey-cross"></i>');
 add('.section-top','signal-chapter','02');
 add('.transmission','signal-orbit',`<svg viewBox="0 0 600 600" focusable="false"><circle cx="300" cy="300" r="205"/><circle cx="300" cy="300" r="246" stroke-dasharray="1 22"/><path d="M300 24v95m0 362v95M70 300h460M300 115 485 300 300 485 115 300Z"/><path class="orbit-accent" d="M240 300h120m-60-60v120"/><circle cx="300" cy="300" r="95" opacity=".45"/></svg>`);
 const progress = document.createElement('div'); progress.className = 'page-progress'; progress.setAttribute('aria-hidden','true'); document.body.append(progress);
 let pending = false;
 const update = () => { const total = document.documentElement.scrollHeight - innerHeight; progress.style.setProperty('--page-progress',total > 0 ? Math.min(1,Math.max(0,scrollY / total)) : 0); pending = false; };
 const queue = () => { if(!pending){pending = true;requestAnimationFrame(update);} };
 addEventListener('scroll',queue,{passive:true});addEventListener('resize',queue,{passive:true});
 new ResizeObserver(queue).observe(document.body);update();
 const reveal = new IntersectionObserver(entries => {for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('signal-entered');reveal.unobserve(entry.target);}}},{threshold:.2});
 document.querySelectorAll('.story-opening,.transmission').forEach(el=>reveal.observe(el));
})();
