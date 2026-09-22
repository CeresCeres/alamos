/* The original snow density (60%) and speed (70%), blowing from upper left to lower right. */
(() => {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'hero-snow';
  canvas.setAttribute('aria-hidden', 'true');
  hero.append(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const random = (a, b) => a + Math.random() * (b - a);
  let w = 0, h = 0, snow = [], frame = 0, last = 0, time = 0, visible = false;
  const active = () => visible && !document.hidden && !reduced.matches;
  function resize() {
    w = hero.clientWidth; h = hero.clientHeight;
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    snow = Array.from({length: Math.round((w < 761 ? 185 : Math.min(590, Math.round(w * h / 2850))) * .6)}, (_, i) => {
      const depth = i % 10 < 5 ? 0 : i % 10 < 9 ? 1 : 2;
      return {x: random(0, w), y: random(0, h), depth,
        radius: random(.45, 1.15) * (1 + depth * .65),
        speed: random(65, 115) * (1 + depth * 1.15), phase: random(0, 7)};
    });
  }
  function draw(now) {
    frame = 0;
    if (!active()) return;
    const dt = last ? Math.min((now - last) / 1000, .05) : 0;
    last = now; time += dt;
    ctx.clearRect(0, 0, w, h);
    const snowTime = time * .7, snowDt = dt * .7;
    const gust = 1.05 + .3 * Math.sin(snowTime * .78) + .16 * Math.sin(snowTime * 1.9);
    for (const p of snow) {
      p.x += p.speed * snowDt * 1.75 * gust;
      p.y += p.speed * snowDt * (.37 + .14 * Math.sin(snowTime * .6 + p.phase));
      if (p.x > w + 50) { p.x = random(-50, -10); p.y = random(-40, h); }
      if (p.y > h + 40) { p.y = -40; p.x = random(0, w); }
      const x = p.x + Math.sin(snowTime * 1.45 + p.phase) * (3 + p.depth * 5);
      const quiet = w > 760 ? .34 + .66 * Math.max(0, Math.min(1, (x / w - .35) * 3)) : .74;
      ctx.globalAlpha = (.19 + p.depth * .13) * quiet;
      ctx.fillStyle = '#deedff';
      const streak = p.radius * (1.6 + p.depth * 1.2) + p.speed * gust * .011;
      ctx.beginPath(); ctx.ellipse(x, p.y, streak, p.radius * .68, .24, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    frame = requestAnimationFrame(draw);
  }
  function sync() {
    cancelAnimationFrame(frame); frame = 0; last = 0;
    canvas.hidden = reduced.matches;
    if (active()) frame = requestAnimationFrame(draw);
  }
  new ResizeObserver(resize).observe(hero);
  new IntersectionObserver(entries => {visible = entries[0].isIntersecting; sync();}, {threshold:.01}).observe(hero);
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);
  resize();
})();
