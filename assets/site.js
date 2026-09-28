// One orchestrated moment: the light ignites and the rogue block lifts out of the grid.
// Everything is progressive; without JS the object renders in its final, lit pose.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rogue = document.getElementById("rogue");
  const aura = document.getElementById("aura");
  const hero = document.querySelector(".marquee");
  const REST = { x: 34, y: -58, r: 22 };
  const ease = "cubic-bezier(.16,1,.3,1)";

  if (rogue && aura && hero && !reduce) {
    aura.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1800, delay: 250, easing: ease, fill: "backwards" })
      .finished.then(() => {
        // the light keeps breathing, slowly
        aura.animate([{ opacity: 1 }, { opacity: .78 }, { opacity: 1 }], { duration: 5600, iterations: Infinity, easing: "cubic-bezier(.65,0,.35,1)" });
      }).catch(() => {});
    rogue.animate(
      [{ transform: "translate(0px,0px) rotate(0deg)" },
       { transform: `translate(${REST.x}px,${REST.y}px) rotate(${REST.r}deg)` }],
      { duration: 1500, delay: 200, easing: ease, fill: "backwards" });

    // As you scroll past the hero, the block drifts a little further out.
    let ticking = false;
    addEventListener("scroll", () => {
      if (ticking) return; ticking = true;
      requestAnimationFrame(() => {
        const p = Math.min(1, Math.max(0, scrollY / (hero.offsetHeight || 1)));
        rogue.style.transform = `translate(${REST.x + p * 14}px,${REST.y - p * 20}px) rotate(${REST.r + p * 16}deg)`;
        ticking = false;
      });
    }, { passive: true });
  }

  // Copy the email; if the clipboard is refused, select the address instead.
  document.querySelectorAll("[data-copy]").forEach((b) => {
    b.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(b.dataset.copy); b.textContent = "Copied"; b.dataset.state = "done"; }
      catch { const a = document.getElementById("email-addr"); if (a) getSelection().selectAllChildren(a); b.textContent = "Selected"; }
      setTimeout(() => { b.textContent = "Copy"; delete b.dataset.state; }, 1800);
    });
  });
})();
