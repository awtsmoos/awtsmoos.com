// B"H
// Touch is a little thunder: the vessel answers with visible consent.
export function createFeedback(world) {
  let count = 0;
  function pulse(node, x = innerWidth / 2, y = innerHeight / 2) {
    count++;
    navigator.vibrate?.(node?.tagName === "BUTTON" ? [12, 18, 8] : 8);
    node?.classList?.remove("pressed");
    void node?.offsetWidth;
    node?.classList?.add("pressed");
    ripple(x, y);
    world.strike?.(x, y);
  }
  function ripple(x, y) {
    const r = document.createElement("i");
    r.className = "touch-ripple";
    r.style.left = `${x}px`;
    r.style.top = `${y}px`;
    document.body.appendChild(r);
    setTimeout(() => r.remove(), 760);
  }
  function bind() {
    document.body.addEventListener("pointerdown", e => {
      const q = "button,.entry,.chip,input,select,textarea,.panel";
      const target = e.target.closest(q);
      if (target) pulse(target, e.clientX, e.clientY);
    }, { passive: true });
    document.body.addEventListener("pointerup", e => {
      e.target.closest("button,.entry,.chip")?.classList.add("released");
    }, { passive: true });
    document.body.addEventListener("animationend", e => {
      e.target.classList.remove("pressed", "released", "mega-pop");
    });
  }
  return { bind, pulse, count: () => count };
}
