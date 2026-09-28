// Rogue Labs site behaviour. Everything here is progressive: without JS the page is complete.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Header gets a hairline once the page scrolls.
  const top = document.getElementById("top");
  const onScrollHeader = () => top && top.classList.toggle("scrolled", scrollY > 8);
  addEventListener("scroll", onScrollHeader, { passive: true }); onScrollHeader();

  // Hero: the rogue block breaks out of its slot on load, then keeps drifting as you scroll.
  const rogue = document.getElementById("rogue");
  const hero = document.querySelector(".hero");
  const REST = { x: 26, y: -58, r: 22 };
  const pose = (p) => {
    const x = REST.x + p * 18, y = REST.y - p * 26, r = REST.r + p * 30;
    rogue.style.transform = `translate(${x}px,${y}px) rotate(${r}deg)`;
  };
  if (rogue && hero && !reduce) {
    rogue.animate(
      [{ transform: "translate(0px,0px) rotate(0deg)" },
       { transform: "translate(8px,-10px) rotate(4deg)", offset: .35 },
       { transform: `translate(${REST.x}px,${REST.y}px) rotate(${REST.r}deg)` }],
      { duration: 1100, delay: 350, easing: "cubic-bezier(.2,.8,.2,1)", fill: "backwards" });
    let ticking = false;
    const onScroll = () => {
      if (ticking) return; ticking = true;
      requestAnimationFrame(() => {
        const h = hero.offsetHeight || 1;
        pose(Math.min(1, Math.max(0, scrollY / h)));
        ticking = false;
      });
    };
    addEventListener("scroll", onScroll, { passive: true });
    rogue.parentElement.parentElement.addEventListener("click", () => {
      rogue.animate([{ transform: rogue.style.transform },
        { transform: rogue.style.transform + " translate(4px,-6px) rotate(10deg)" },
        { transform: rogue.style.transform }], { duration: 420, easing: "cubic-bezier(.2,.8,.2,1)" });
    });
  }

  // Facts count up once, but only when they scroll into view from below (never on first paint).
  const fmt = (n) => n.toLocaleString("en-US");
  const counters = [...document.querySelectorAll("[data-count]")];
  if (!reduce && "IntersectionObserver" in window) {
    const below = counters.filter((el) => el.getBoundingClientRect().top > innerHeight);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        const el = e.target, end = +el.dataset.count, suf = el.dataset.suffix || "", t0 = performance.now(), dur = 1100;
        const step = (t) => {
          const k = Math.min(1, (t - t0) / dur), v = Math.round(end * (1 - Math.pow(1 - k, 3)));
          el.textContent = fmt(v) + (k === 1 ? suf : "");
          if (k < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: .6 });
    below.forEach((el) => io.observe(el));
  }

  // Copy buttons (fall back to selecting the address if the clipboard is refused).
  document.querySelectorAll("[data-copy]").forEach((b) => {
    b.addEventListener("click", async () => {
      const text = b.dataset.copy;
      try { await navigator.clipboard.writeText(text); b.textContent = "Copied"; b.classList.add("done"); }
      catch { const a = b.parentElement.querySelector(".addr"); if (a) getSelection().selectAllChildren(a); b.textContent = "Selected"; }
      setTimeout(() => { b.textContent = "Copy"; b.classList.remove("done"); }, 1800);
    });
  });
})();
