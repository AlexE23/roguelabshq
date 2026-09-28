// Dust in the light: specks drifting behind the whole page. Brightest in the rogue block's glow,
// a faint ambient drift everywhere else, and a little parallax as the page scrolls.
// Pauses when the tab is hidden; with reduced motion it draws one still frame.
(() => {
  const rogue = document.getElementById("rogue");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const AMBIENT = 0.38;      // how visible dust is away from the light
  const PARALLAX = 0.22;     // dust moves at ~1/5 of the scroll speed

  const layer = document.createElement("div");
  layer.className = "bg-layer"; layer.setAttribute("aria-hidden", "true");
  const canvas = document.createElement("canvas"); canvas.className = "bg-dust";
  layer.append(canvas); document.body.prepend(layer);

  const ctx = canvas.getContext("2d"), dpr = Math.min(2, devicePixelRatio || 1);
  const color = getComputedStyle(document.documentElement).getPropertyValue("--color-accent").trim() || "oklch(84% 0.09 78)";
  let w = 0, h = 0, motes = [], raf = 0, lastY = scrollY;

  const light = () => {
    if (!rogue) return null;
    const r = rogue.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };
  const size = () => {
    w = innerWidth; h = innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(90, (w * h) / 12000));
    motes = Array.from({ length: n }, () => ({
      x: Math.random() * w, y: Math.random() * h, r: .7 + Math.random() * 1.5,
      vx: (Math.random() - .5) * .08, vy: -.04 - Math.random() * .12, p: Math.random() * 6.283,
    }));
  };
  const wrap = (m) => {
    if (m.y < -4) { m.y += h + 8; m.x = Math.random() * w; } else if (m.y > h + 4) { m.y -= h + 8; m.x = Math.random() * w; }
    if (m.x < -4) m.x = w + 4; else if (m.x > w + 4) m.x = -4;
  };
  const draw = () => {
    const L = light(), dy = (scrollY - lastY) * PARALLAX; lastY = scrollY;
    ctx.clearRect(0, 0, w, h); ctx.fillStyle = color;
    for (const m of motes) {
      m.y -= dy;
      if (!reduce) { m.x += m.vx; m.y += m.vy; m.p += .012; }
      wrap(m);
      const lit = L ? Math.max(0, 1 - Math.hypot(m.x - L.x, m.y - L.y) / 420) : 0;
      const a = Math.max(lit * lit, AMBIENT) * (.55 + .45 * Math.sin(m.p));
      if (a < .02) continue;
      ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, 6.283); ctx.fill();
    }
    if (!reduce && !document.hidden) raf = requestAnimationFrame(draw);
  };

  size(); draw();
  addEventListener("resize", () => { size(); if (reduce) draw(); });
  if (reduce) addEventListener("scroll", () => requestAnimationFrame(draw), { passive: true });
  document.addEventListener("visibilitychange", () => {
    cancelAnimationFrame(raf);
    if (!document.hidden && !reduce) { lastY = scrollY; raf = requestAnimationFrame(draw); }
  });
})();
