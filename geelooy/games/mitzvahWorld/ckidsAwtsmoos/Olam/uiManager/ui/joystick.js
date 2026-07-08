// B"H
/** @file joystick.js @description Mobile walking and jump controls with a real held jump. */
import { installMobileVisualViewportInsets } from "./mobileVisualViewportInsets.js?compact=true&v=solid-browser-verify-20260702-bh9";
const STYLE_ID = "awts-mobile-joystick-runtime";
const MIN_JUMP_HOLD_MS = 170;

function worker() { return window.mana?.socket?.eved || window.mana?.eved || null; }
function post(payload) {
  document.querySelector('[shaym="ikar"]')?.dispatchEvent(new CustomEvent("olamPeula", {
    bubbles:true,
    detail:{ olamPeula:payload }
  }));
  worker()?.postMessage?.({ olamPeula:payload });
}
function raw(type, code) { worker()?.postMessage?.({ [type]:{ code, source:"mobileJump" } }); }
function emitKeyboard(type) {
  const options = { key:" ", code:"Space", bubbles:true, cancelable:true };
  window.dispatchEvent(new KeyboardEvent(type, options));
  document.dispatchEvent(new KeyboardEvent(type, options));
}
function pressJump() { post({ setInput:{ code:"Space" } }); raw("keydown", "Space"); emitKeyboard("keydown"); }
function releaseJump() { post({ setInputOut:{ code:"Space" } }); raw("keyup", "Space"); emitKeyboard("keyup"); }

function injectStyles(doc = document) {
  installMobileVisualViewportInsets(doc, globalThis.window);
  if (!doc || doc.getElementById(STYLE_ID)) return;
  const style = doc.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    :root{--awts-mobile-safe-bottom:max(calc(var(--awts-visual-bottom,0px) + env(safe-area-inset-bottom,0px)),calc(var(--awts-visual-bottom,0px) + 10px));--awts-mobile-rail-bottom:calc(var(--awts-mobile-safe-bottom) + 78px)}
    #joystick-container{position:fixed!important;left:max(14px,env(safe-area-inset-left,0px) + 10px)!important;top:auto!important;bottom:var(--awts-mobile-rail-bottom)!important;width:86px!important;height:86px!important;max-width:24vw!important;max-height:24vw!important;min-width:74px!important;min-height:74px!important;z-index:28000!important;pointer-events:auto!important;touch-action:none!important}
    #joystick-base{width:100%!important;height:100%!important;border-radius:50%!important;position:relative!important;background:radial-gradient(circle at 45% 42%,rgba(96,255,242,.16),rgba(0,0,20,.38))!important;border:2px solid rgba(0,255,237,.42)!important;box-shadow:0 0 16px rgba(0,255,237,.22),inset 0 0 24px rgba(0,0,0,.34)!important;pointer-events:auto!important;touch-action:none!important}
    #joystick-thumb{width:42px!important;height:42px!important;border-radius:50%!important;position:absolute!important;left:calc(50% - 21px)!important;top:calc(50% - 21px)!important;background:radial-gradient(circle at 34% 31%,#fff 0%,#bffcff 30%,#46edf5 100%)!important;box-shadow:0 0 20px rgba(83,247,255,.62)!important;transition:transform .03s linear!important;pointer-events:none!important}
    #mobile-jump-button{position:fixed!important;right:max(14px,env(safe-area-inset-right,0px) + 10px)!important;top:auto!important;bottom:var(--awts-mobile-rail-bottom)!important;width:56px!important;height:56px!important;min-width:52px!important;min-height:52px!important;border-radius:50%!important;display:flex!important;align-items:center!important;justify-content:center!important;font:900 31px Arial,sans-serif!important;color:#fff8cc!important;background:radial-gradient(circle at 35% 28%,rgba(255,255,255,.18),rgba(13,4,52,.78))!important;border:2px solid rgba(255,215,0,.56)!important;box-shadow:0 7px 16px rgba(0,0,0,.42),0 0 16px rgba(255,215,0,.18)!important;z-index:28010!important;pointer-events:auto!important;user-select:none!important;touch-action:none!important}
    #mobile-jump-button.active-state{transform:scale(.9)!important;background:rgba(255,215,0,.86)!important;color:#2b1500!important}
    @media(max-width:430px){:root{--awts-mobile-rail-bottom:calc(var(--awts-mobile-safe-bottom) + 76px)}#joystick-container{width:78px!important;height:78px!important}#mobile-jump-button{width:54px!important;height:54px!important}}
    @media(orientation:landscape) and (max-height:520px){:root{--awts-mobile-rail-bottom:calc(var(--awts-mobile-safe-bottom) + 52px)}#joystick-container{width:72px!important;height:72px!important}#mobile-jump-button{width:50px!important;height:50px!important}}
  `;
  doc.head.appendChild(style);
}

function bindJumpButton(button) {
  injectStyles(button?.ownerDocument);
  let activeId = null, downAt = 0, releaseTimer = 0;
  const pointerId = e => e.pointerId ?? e.changedTouches?.[0]?.identifier ?? "mouse";
  const finishRelease = () => { releaseTimer = 0; releaseJump(); };
  const down = e => {
    if (activeId !== null) return;
    activeId = pointerId(e);
    downAt = performance.now();
    clearTimeout(releaseTimer);
    e.preventDefault?.(); e.stopPropagation?.();
    button.classList.add("active-state");
    button.dataset.jumpDownCount = String(Number(button.dataset.jumpDownCount || 0) + 1);
    button.dataset.jumpLastDownAt = String(Date.now());
    pressJump();
  };
  const up = e => {
    const id = pointerId(e);
    if (activeId !== id && activeId !== "mouse") return;
    activeId = null;
    e.preventDefault?.(); e.stopPropagation?.();
    button.classList.remove("active-state");
    button.dataset.jumpUpCount = String(Number(button.dataset.jumpUpCount || 0) + 1);
    button.dataset.jumpLastUpAt = String(Date.now());
    const wait = Math.max(0, MIN_JUMP_HOLD_MS - (performance.now() - downAt));
    clearTimeout(releaseTimer);
    releaseTimer = setTimeout(finishRelease, wait);
  };
  if (window.PointerEvent) ["pointerdown","pointerup","pointercancel","lostpointercapture"].forEach(type => button.addEventListener(type, type === "pointerdown" ? down : up, { passive:false }));
  else {
    button.addEventListener("touchstart", down, { passive:false });
    button.addEventListener("touchend", up, { passive:false });
    button.addEventListener("touchcancel", up, { passive:false });
    button.addEventListener("mousedown", down);
    button.addEventListener("mouseup", up);
  }
}

function readyJoystick(el) { injectStyles(el?.ownerDocument); }

export default [
  { id:"joystick-container", ready:readyJoystick, style:{ pointerEvents:"auto", zIndex:"28000" }, children:[{ id:"joystick-base", style:{ pointerEvents:"auto" }, children:[{ id:"joystick-thumb", style:{ pointerEvents:"none" } }] }] },
  { id:"mobile-jump-button", className:"mobile-jump-button", textContent:"↑", ready:bindJumpButton, style:{ pointerEvents:"auto", zIndex:"28010" } }
];
