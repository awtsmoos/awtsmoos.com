// B"H
/**
 * @file MobileUiTikkunStyle.js
 * @description Chapter 441: the interface stops swallowing the meadow. The
 * Awtsmoos lets every panel become small, quiet, and cheap on mobile glass.
 */
const STYLE_ID = "awtsmoosMobileUiTikkunStyle";
function css(checklistId) { return `
@media (max-width:760px),(pointer:coarse){
  #${checklistId}.schoolChip{position:fixed!important;right:10px!important;top:112px!important;z-index:9050!important;width:auto!important;max-width:46vw!important;padding:0!important;background:transparent!important;border:0!important;box-shadow:none!important;pointer-events:auto!important;font-family:Inter,system-ui,sans-serif!important}
  #${checklistId} .schoolToggle{border:1px solid rgba(255,216,104,.75);border-radius:999px;padding:8px 12px;background:rgba(8,12,18,.72);color:#ffe68a;font-weight:900;font-size:13px;box-shadow:0 4px 12px rgba(0,0,0,.22);touch-action:manipulation}
  #${checklistId} .schoolBody{display:none;position:fixed;right:8px;bottom:112px;width:min(82vw,330px);max-height:38vh;overflow:auto;border:1px solid rgba(255,216,104,.45);border-radius:16px;padding:10px;background:rgba(7,10,14,.9);box-shadow:0 8px 18px rgba(0,0,0,.28)}
  #${checklistId}.open .schoolBody{display:block}
  #${checklistId} label{display:grid!important;grid-template-columns:24px 1fr;gap:6px;margin:7px 0!important;color:#e9edf7!important;font-size:13px!important}
  #${checklistId} input{width:20px;height:20px} #${checklistId} b{font-size:13px!important;color:#fff2aa!important} #${checklistId} small{display:block;font-size:11px!important;line-height:1.25!important;color:#cbd3df!important}
  .premium-dialogue-container{left:8px!important;right:8px!important;bottom:calc(env(safe-area-inset-bottom,0px) + 10px)!important;top:auto!important;transform:none!important;width:auto!important;max-width:none!important;max-height:46vh!important;overflow:auto!important;padding:14px!important;border-radius:18px!important;gap:10px!important;background:rgba(7,10,14,.9)!important;backdrop-filter:none!important;box-shadow:0 8px 18px rgba(0,0,0,.32)!important;z-index:9100!important}
  .premium-dialogue-container h1,.premium-dialogue-container h2{font-size:18px!important;letter-spacing:.4px!important;text-transform:none!important}.premium-dialogue-container p,.dialogue-text{font-size:15px!important;line-height:1.35!important}.dialogue-responses{gap:8px!important;margin-top:4px!important}.dialogue-response-btn{font-size:14px!important;padding:10px 12px!important;border-radius:12px!important}
  [id*='HUD'],[class*='HUD'],[id*='hud'],[class*='hud'],[id*='gameHUD'],[class*='gameHUD']{max-width:52vw!important;transform-origin:top left!important}
  .mitzvahPanel:not(#${checklistId}),.loading,.loadingContent,[class*='action'],[id*='action'],[class*='inventory'],[id*='inventory']{backdrop-filter:none!important;box-shadow:0 4px 12px rgba(0,0,0,.24)!important}
  body.awtsmoos-dialogue-open [id*='action'],body.awtsmoos-dialogue-open [class*='actionBar'],body.awtsmoos-dialogue-open [class*='inventoryBar'],body.awtsmoos-dialogue-open [class*='hotbar']{opacity:.16!important;pointer-events:none!important;transform:translateY(24px)!important}
  body.awtsmoos-world-clean [class*='actionBar'],body.awtsmoos-world-clean [class*='inventoryBar'],body.awtsmoos-world-clean [class*='hotbar']{opacity:.42!important;transform:translateY(18px)!important}
  .awtsmoos-perf-chip{position:fixed;left:8px;top:104px;z-index:9200;padding:5px 7px;border-radius:8px;background:rgba(0,0,0,.58);color:#c9f7ff;font:700 11px/1.25 ui-monospace,monospace;pointer-events:none}
}
`; }
export function injectMobileUiTikkunStyle(doc = globalThis.document, checklistId = "awtsmoosSchoolChecklist") { if (!doc || doc.getElementById(STYLE_ID)) return; const style = doc.createElement("style"); style.id = STYLE_ID; style.textContent = css(checklistId); doc.head.appendChild(style); }
export default injectMobileUiTikkunStyle;
