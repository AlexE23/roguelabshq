// Dust in the light: a few specks drifting through the hero, visible only near the rogue block's glow.
// Pauses when the tab is hidden; with reduced motion it draws one still frame.
(() => {
  const hero = document.querySelector(".marquee");
  const rogue = document.getElementById("rogue");
  if (!hero || !rogue) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const layer = document.createElement("div");
  layer.className = "bg-layer"; layer.setAttribute("aria-hidden", "true");
  const canvas = document.createElement("canvas"); canvas.className = "bg-dust";
  layer.append(canvas); hero.prepend(layer);

  const ctx = canvas.getContext("2d"), dpr = Math.min(2, devicePixelRatio || 1);
  const color = getComputedStyle(document.documentElement).getPropertyValue("--color-accent").trim() || "oklch(84% 0.09 78)";
  let w = 0, h = 0, motes = [], raf = 0;

  const light = () => {
    const a = hero.getBoundingClientRect(), r = rogue.getBoundingClientRect();
    return { x: r.left + r.width / 2 - a.left, y: r.top + r.height / 2 - a.top };
  };
  const size = () => {
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(70, (w * h) / 16000));
    motes = Array.from({ length: n }, () => ({
      x: Math.random() * w, y: Math.random() * h, r: .5 + Math.random() * 1.3,
      vx: (Math.random() - .5) * .08, vy: -.04 - Math.random() * .12, p: Math.random() * 6.283,
    }));
  };
  const draw = () => {
    const L = light();
    ctx.clearRect(0, 0, w, h); ctx.fillStyle = color;
    for (const m of motes) {
      if (!reduce) {
        m.x += m.vx; m.y += m.vy; m.p += .012;
        if (m.y < -4) { m.y = h + 4; m.x = Math.random() * w; }
        if (m.x < -4) m.x = w + 4; else if (m.x > w + 4) m.x = -4;
      }
      const lit = Math.max(0, 1 - Math.hypot(m.x - L.x, m.y - L.y) / 420);
      const a = lit * lit * (.55 + .45 * Math.sin(m.p));
      if (a < .02) continue;
      ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, 6.283); ctx.fill();
    }
    if (!reduce && !document.hidden) raf = requestAnimationFrame(draw);
  };

  size(); draw();
  addEventListener("resize", () => { size(); if (reduce) draw(); });
  document.addEventListener("visibilitychange", () => {
    cancelAnimationFrame(raf);
    if (!document.hidden && !reduce) raf = requestAnimationFrame(draw);
  });
})();
