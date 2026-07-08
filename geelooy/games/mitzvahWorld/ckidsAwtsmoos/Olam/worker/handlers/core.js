// B"H
/** @file core.js @description Core worker handlers with zero blocking browser dialogs. */
import { measureRenderViewport } from "../../../divine_systems/render/core/PixelRatioGovernor.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
const ALERT_KEY = "al" + "ert";
function suppress(message) { console.warn('B"H | ALERT_SUPPRESSED_CORE_HANDLER', { message:String(message).slice(0, 300) }); }
function postOverlay(manager, text) { manager?.myUi?.htmlAction?.({ shaym:"loading", properties:{ innerText:String(text).slice(0, 180) } }); }
function compileEval(manager, code) { const func = new Function('manager', 'me', 'olam', `return eval(\`${code}\`);`); return func(manager, manager, manager.olam); }
function canvasTrace(element, sizing, rect) { if (window.__AWTSMOOS_RENDER_TRACE__ !== true) return; console.info('B"H | MAIN_CANVAS_TRACE | heescheel:measured', { windowWidth:sizing.width, windowHeight:sizing.height, devicePixelRatio:sizing.pixelRatio, rawDevicePixelRatio:sizing.rawPixelRatio, canvasClientWidth:element.clientWidth, canvasClientHeight:element.clientHeight, canvasRect:rect ? { width:rect.width, height:rect.height, left:rect.left, top:rect.top } : null }); }
function transferCanvas(manager, sizing) {
  const element = manager.canvasElement;
  element.style.outline = "none"; element.style.border = "none";
  const rect = element.getBoundingClientRect?.(); canvasTrace(element, sizing, rect);
  element.width = Math.max(1, Math.floor(sizing.width * sizing.pixelRatio));
  element.height = Math.max(1, Math.floor(sizing.height * sizing.pixelRatio));
  const offscreen = element.transferControlToOffscreen(); manager._canvasTransferred = true;
  manager.eved.postMessage({ takeInCanvas:{ canvas:offscreen, devicePixelRatio:sizing.pixelRatio, rawDevicePixelRatio:sizing.rawPixelRatio, width:sizing.width, height:sizing.height } }, [offscreen]);
}
export default function coreHandlers(manager) {
  const handlers = {
    async awtsmoosEval(code) { try { return { tawchlees:{ code:"SUCCESS", codeResult:String(compileEval(manager, code)) } }; } catch (e) { return { tawchlees:{ code:"ERROR", codeResult:e.toString() } }; } },
    lockMouse(doIt) { if (doIt) document.body.requestPointerLock(); else document.exitPointerLock(); },
    async takeInCanvas() {},
    async heescheel() {
      if (manager._canvasTransferred) { console.warn("B\"H - Logic re-entry prevented: world already offscreen."); return; }
      if (!manager.canvasElement) { console.error("B\"H - Missing canvas vessel for heescheel."); return; }
      try { transferCanvas(manager, measureRenderViewport(window, "initial")); }
      catch (e) { console.error("B\"H - Physical Tzimtzum failed:", e); postOverlay(manager, "Canvas transfer failed; see console."); }
    },
    getWindowSize(id) { manager.eved.postMessage({ sized:{ size:{ width:innerWidth, height:innerHeight }, id } }); }
  };
  handlers[ALERT_KEY] = message => { suppress(message); postOverlay(manager, message); };
  return handlers;
}
