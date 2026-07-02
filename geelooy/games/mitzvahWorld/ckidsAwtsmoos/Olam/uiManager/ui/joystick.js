// B"H
/** Mobile walking and jumping controls: jump now speaks the same setInput language as the dock. */
function worker() { return window.mana?.socket?.eved || window.mana?.eved || null; }
function post(payload) {
  document.querySelector('[shaym="ikar"]')?.dispatchEvent(new CustomEvent("olamPeula", { bubbles: true, detail:{ olamPeula:payload } }));
  worker()?.postMessage?.({ olamPeula:payload });
  worker()?.postMessage?.(payload);
}
function sendKey(type, code) { post({ [type]: { code } }); }
function pressJump() { sendKey("setInput", "Space"); sendKey("keydown", "Space"); }
function releaseJump() { sendKey("setInputOut", "Space"); sendKey("keyup", "Space"); }
export default [
  { id:"joystick-container", style:{ pointerEvents:"auto", zIndex:"12000" }, children:[{ id:"joystick-base", style:{ pointerEvents:"auto" }, child:{ id:"joystick-thumb", style:{ pointerEvents:"none" } } }] },
  { id:"mobile-jump-button", textContent:"↑", style:{ pointerEvents:"auto", zIndex:"12000" }, ready(m) { let active=false; const down=e=>{e.preventDefault();e.stopPropagation();if(active)return;active=true;m.classList.add("active-state");pressJump();}; const up=e=>{e.preventDefault?.();e.stopPropagation?.();if(!active)return;active=false;m.classList.remove("active-state");releaseJump();}; m.addEventListener("touchstart",down,{passive:false});m.addEventListener("pointerdown",down,{passive:false});m.addEventListener("mousedown",down);m.addEventListener("touchend",up,{passive:false});m.addEventListener("touchcancel",up,{passive:false});m.addEventListener("pointerup",up,{passive:false});m.addEventListener("pointercancel",up,{passive:false});m.addEventListener("mouseup",up);m.addEventListener("mouseleave",up); } },
  { tag:"style", innerHTML:`
    :root{--awts-mobile-safe-bottom:max(env(safe-area-inset-bottom,0px),10px);--awts-mobile-rail-bottom:calc(var(--awts-mobile-safe-bottom) + 18px);--awts-mobile-action-bottom:calc(var(--awts-mobile-safe-bottom) + 128px)}
    #joystick-container{position:fixed;left:max(18px,env(safe-area-inset-left,0px) + 14px);bottom:var(--awts-mobile-rail-bottom);width:min(31vw,118px);height:min(31vw,118px);max-width:118px;max-height:118px;min-width:96px;min-height:96px;pointer-events:auto!important;touch-action:none}
    #joystick-base{width:100%;height:100%;border-radius:50%;position:relative;background:radial-gradient(circle at 45% 42%,rgba(96,255,242,.18),rgba(0,0,20,.42));border:3px solid rgba(0,255,237,.46);box-shadow:0 0 20px rgba(0,255,237,.28),inset 0 0 30px rgba(0,0,0,.36)}
    #joystick-thumb{width:54px;height:54px;border-radius:50%;position:absolute;left:calc(50% - 27px);top:calc(50% - 27px);background:radial-gradient(circle at 34% 31%,#fff 0%,#bffcff 30%,#46edf5 100%);box-shadow:0 0 24px rgba(83,247,255,.76);transition:transform .035s linear}
    #mobile-jump-button{position:fixed;right:max(18px,env(safe-area-inset-right,0px) + 14px);bottom:calc(var(--awts-mobile-rail-bottom) + 4px);width:min(18vw,66px);height:min(18vw,66px);min-width:56px;min-height:56px;border-radius:50%;display:flex;align-items:center;justify-content:center;font:900 34px Arial,sans-serif;color:#fff8cc;background:radial-gradient(circle at 35% 28%,rgba(255,255,255,.18),rgba(13,4,52,.78));border:3px solid rgba(255,215,0,.58);box-shadow:0 7px 16px rgba(0,0,0,.46),0 0 18px rgba(255,215,0,.18);pointer-events:auto!important;user-select:none;touch-action:none}
    #mobile-jump-button.active-state{transform:scale(.9);background:rgba(255,215,0,.86);color:#2b1500}
    @media(hover:none),(pointer:coarse),(max-width:760px){.actionBar,.action-bar,#actionBar,[class*="actionBar"],[class*="action-bar"]{bottom:var(--awts-mobile-action-bottom)!important;left:50%!important;transform:translateX(-50%)!important;max-width:min(72vw,480px)!important;width:auto!important;z-index:11950!important}.actionBar button,.action-bar button,#actionBar button,[class*="actionBar"] button,[class*="action-bar"] button{min-width:54px!important;min-height:54px!important;padding:6px 9px!important;font-size:14px!important}}
    @media(max-width:430px){:root{--awts-mobile-action-bottom:calc(var(--awts-mobile-safe-bottom) + 118px)}#joystick-container{width:104px;height:104px;left:max(14px,env(safe-area-inset-left,0px) + 10px)}#mobile-jump-button{right:max(14px,env(safe-area-inset-right,0px) + 10px);width:58px;height:58px}}
  ` }
];
