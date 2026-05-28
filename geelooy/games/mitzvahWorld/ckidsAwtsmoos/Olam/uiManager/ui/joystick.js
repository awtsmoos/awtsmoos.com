// B"H
/**
 * @file joystick.js
 * @description
 * Chapter 15: Two small circles replace the tangled machine.
 *
 * The Awtsmoos leaves the mobile player with only what Level 1 needs: a left
 * thumbstick for walking and one right jump button. The huge inventory/action
 * flower no longer devours the desert view.
 */
export default [
  {
    id: "joystick-container",
    style: { pointerEvents: "auto", zIndex: "12000" },
    children: [{ id: "joystick-base", style: { pointerEvents: "auto" }, child: { id: "joystick-thumb", style: { pointerEvents: "none" } } }]
  },
  {
    id: "mobile-jump-button",
    textContent: "↑",
    style: { pointerEvents: "auto", zIndex: "12000" },
    ready(m, $f) {
      const ik = $f("ikar");
      if (!ik) return;
      const send = type => ik.dispatchEvent(new CustomEvent("olamPeula", { detail: { [type]: { code: "Space" } } }));
      const down = e => { e.preventDefault(); e.stopPropagation(); m.classList.add("active-state"); send("keydown"); };
      const up = e => { e.preventDefault(); e.stopPropagation(); m.classList.remove("active-state"); send("keyup"); };
      m.addEventListener("touchstart", down, { passive: false });
      m.addEventListener("mousedown", down);
      m.addEventListener("touchend", up, { passive: false });
      m.addEventListener("touchcancel", up, { passive: false });
      m.addEventListener("mouseup", up);
      m.addEventListener("mouseleave", up);
    }
  },
  {
    tag: "style",
    innerHTML: `
      #joystick-container {
        position: fixed;
        left: 22px;
        bottom: 28px;
        width: 118px;
        height: 118px;
        pointer-events: auto !important;
        touch-action: none;
      }
      #joystick-base {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        position: relative;
        background: rgba(0, 0, 20, .34);
        border: 3px solid rgba(0, 255, 237, .42);
        box-shadow: 0 0 18px rgba(0, 255, 237, .25);
      }
      #joystick-thumb {
        width: 54px;
        height: 54px;
        border-radius: 50%;
        position: absolute;
        left: calc(50% - 27px);
        top: calc(50% - 27px);
        background: radial-gradient(circle, #fff 0%, #53f7ff 100%);
        box-shadow: 0 0 22px rgba(83, 247, 255, .72);
        transition: transform .04s linear;
      }
      #mobile-jump-button {
        position: fixed;
        right: 24px;
        bottom: 42px;
        width: 64px;
        height: 64px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font: bold 34px Arial, sans-serif;
        color: #fff8cc;
        background: rgba(13, 4, 52, .70);
        border: 3px solid rgba(255, 215, 0, .55);
        box-shadow: 0 7px 14px rgba(0,0,0,.42);
        pointer-events: auto !important;
        user-select: none;
        touch-action: none;
      }
      #mobile-jump-button.active-state {
        transform: scale(.9);
        background: rgba(255, 215, 0, .84);
        color: #2b1500;
      }
      @media (max-width: 430px) {
        #joystick-container { width: 108px; height: 108px; left: 18px; bottom: 24px; }
        #mobile-jump-button { right: 18px; bottom: 34px; width: 58px; height: 58px; }
      }
    `
  }
];
