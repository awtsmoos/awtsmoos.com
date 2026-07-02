// B"H
/** Mobile walking and jumping controls. Jump is held by one touch, not double-fired. */
function worker() { return window.mana?.socket?.eved || window.mana?.eved || null; }
function post(payload) {
  document.querySelector('[shaym="ikar"]')?.dispatchEvent(new CustomEvent("olamPeula", { bubbles:true, detail:{ olamPeula:payload } }));
  worker()?.postMessage?.({ olamPeula:payload });
}
function sendKey(type, code) { post({ [type]:{ code } }); }
function pressJump() { sendKey("setInput", "Space"); }
function releaseJump() { sendKey("setInputOut", "Space"); }
function bindJumpButton(m) {
  let activeId = null;
  const down = e => {
    if (activeId !== null) return;
    activeId = e.pointerId ?? e.changedTouches?.[0]?.identifier ?? "mouse";
    e.preventDefault?.(); e.stopPropagation?.(); m.classList.add("active-state"); pressJump();
  };
  const up = e => {
    const id = e.pointerId ?? e.changedTouches?.[0]?.identifier ?? "mouse";
    if (activeId !== id && activeId !== "mouse") return;
    activeId = null; e.preventDefault?.(); e.stopPropagation?.(); m.classList.remove("active-state"); releaseJump();
  };
  if (window.PointerEvent) {
    m.addEventListener("pointerdown", down, { passive:false });
    m.addEventListener("pointerup", up, { passive:false });
    m.addEventListener("pointercancel", up, { passive:false });
    m.addEventListener("lostpointercapture", up, { passive:false });
  } else {
    m.addEventListener("touchstart", down, { passive:false });
    m.addEventListener("touchend", up, { passive:false });
    m.addEventListener("touchcancel", up, { passive:false });
    m.addEventListener("mousedown", down);
    m.addEventListener("mouseup", up);
  }
}
export default [
  { id:"joystick-container", style:{ pointerEvents:"auto", zIndex:"12000" }, children:[{ id:"joystick-base", style:{ pointerEvents:"auto" }, child:{ id:"joystick-thumb", style:{ pointerEvents:"none" } } }] },
  { id:"mobile-jump-button", textContent:"↑", style:{ pointerEvents:"auto", zIndex:"12000" }, ready:bindJumpButton },
  { tag:"style", innerHTML:`
    :root{--awts-mobile-safe-bottom:max(env(safe-area-inset-bottom,0px),10px);--awts-mobile-rail-bottom:calc(var(--awts-mobile-safe-bottom) + 78px)}
    #joystick-container{position:fixed;left:max(14px,env(safe-area-inset-left,0px) + 10px);bottom:var(--awts-mobile-rail-bottom);width:86px;height:86px;max-width:24vw;max-height:24vw;min-width:74px;min-height:74px;pointer-events:auto!important;touch-action:none}
    #joystick-base{width:100%;height:100%;border-radius:50%;position:relative;background:radial-gradient(circle at 45% 42%,rgba(96,255,242,.16),rgba(0,0,20,.38));border:2px solid rgba(0,255,237,.42);box-shadow:0 0 16px rgba(0,255,237,.22),inset 0 0 24px rgba(0,0,0,.34)}
    #joystick-thumb{width:42px;height:42px;border-radius:50%;position:absolute;left:calc(50% - 21px);top:calc(50% - 21px);background:radial-gradient(circle at 34% 31%,#fff 0%,#bffcff 30%,#46edf5 100%);box-shadow:0 0 20px rgba(83,247,255,.62);transition:transform .03s linear}
    #mobile-jump-button{position:fixed;right:max(14px,env(safe-area-inset-right,0px) + 10px);bottom:var(--awts-mobile-rail-bottom);width:56px;height:56px;min-width:52px;min-height:52px;border-radius:50%;display:flex;align-items:center;justify-content:center;font:900 31px Arial,sans-serif;color:#fff8cc;background:radial-gradient(circle at 35% 28%,rgba(255,255,255,.18),rgba(13,4,52,.78));border:2px solid rgba(255,215,0,.56);box-shadow:0 7px 16px rgba(0,0,0,.42),0 0 16px rgba(255,215,0,.18);pointer-events:auto!important;user-select:none;touch-action:none}
    #mobile-jump-button.active-state{transform:scale(.9);background:rgba(255,215,0,.86);color:#2b1500}
    @media(max-width:430px){:root{--awts-mobile-rail-bottom:calc(var(--awts-mobile-safe-bottom) + 76px)}#joystick-container{width:78px;height:78px}#mobile-jump-button{width:54px;height:54px}}
    @media(orientation:landscape) and (max-height:520px){:root{--awts-mobile-rail-bottom:calc(var(--awts-mobile-safe-bottom) + 52px)}#joystick-container{width:72px;height:72px}#mobile-jump-button{width:50px;height:50px}}
  ` }
];
