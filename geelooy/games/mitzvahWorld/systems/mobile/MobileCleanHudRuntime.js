// B"H
/** MobileCleanHudRuntime: world-first HUD with loop policy and stronger clutter collapse. */
import { defer } from '../performance/RuntimeLoopPolicy.js';
const STYLE_ID = 'awtsmoosMobileCleanHudStyle';
function css() { return `
@media (max-width:820px),(pointer:coarse){
  body.awtsmoos-mobile-clean-hud #mitzvahTopLeft{width:min(34vw,150px)!important;max-height:20vh!important;overflow:hidden!important;gap:2px!important;transform:scale(.66)!important;transform-origin:top left!important;opacity:.74!important;pointer-events:none!important}
  body.awtsmoos-mobile-clean-hud #mitzvahTopRight{width:min(30vw,142px)!important;max-height:18vh!important;overflow:hidden!important;transform:scale(.62)!important;transform-origin:top right!important;opacity:.66!important;pointer-events:none!important}
  body.awtsmoos-mobile-clean-hud #mitzvahCenter{display:none!important}
  body.awtsmoos-mobile-clean-hud #mitzvahBottomCenter{bottom:calc(8px + env(safe-area-inset-bottom,0px))!important;width:min(72vw,390px)!important;opacity:.82!important;pointer-events:none!important}
  body.awtsmoos-mobile-clean-hud #mitzvahTopLeft .mitzvahPanel:nth-child(n+2),body.awtsmoos-mobile-clean-hud #mitzvahTopRight .mitzvahPanel:nth-child(n+2),body.awtsmoos-mobile-clean-hud #mitzvahBottomCenter .mitzvahPanel:nth-child(n+2){display:none!important}
  body.awtsmoos-mobile-clean-hud #mitzvahDreamSpine,body.awtsmoos-mobile-clean-hud #mitzvahWorldMarkers{display:none!important}
  body.awtsmoos-mobile-clean-hud .mitzvahPanel{font-size:10px!important;line-height:1.08!important;padding:5px 6px!important;background:rgba(5,8,12,.38)!important;border-color:rgba(255,217,102,.22)!important;box-shadow:none!important;backdrop-filter:none!important}
  body.awtsmoos-mobile-clean-hud .mitzvahPanelHead{padding:0!important;background:transparent!important;position:static!important}
  body.awtsmoos-mobile-clean-hud .mitzvahPanelBody{max-height:58px!important;overflow:hidden!important}
  body.awtsmoos-mobile-clean-hud #awtsmoosCleanHudToggle{display:block!important}
  body.awtsmoos-mobile-full-hud #mitzvahTopLeft,body.awtsmoos-mobile-full-hud #mitzvahTopRight,body.awtsmoos-mobile-full-hud #mitzvahBottomCenter{pointer-events:auto!important;opacity:1!important;max-height:72vh!important;overflow:auto!important;transform:none!important}
  body.awtsmoos-mobile-full-hud #mitzvahCenter{display:flex!important}
  body.awtsmoos-mobile-full-hud #mitzvahTopLeft .mitzvahPanel,body.awtsmoos-mobile-full-hud #mitzvahTopRight .mitzvahPanel,body.awtsmoos-mobile-full-hud #mitzvahBottomCenter .mitzvahPanel{display:block!important}
}
#awtsmoosCleanHudToggle{display:none;position:fixed;right:10px;bottom:calc(74px + env(safe-area-inset-bottom,0px));z-index:9990;width:42px;height:42px;border-radius:999px;border:1px solid rgba(255,217,102,.62);background:rgba(5,8,12,.58);color:#ffe28a;font:900 16px/1 system-ui;box-shadow:0 5px 14px rgba(0,0,0,.22)}
`; }
function inject(doc) { if (!doc || doc.getElementById(STYLE_ID)) return; const style = doc.createElement('style'); style.id = STYLE_ID; style.textContent = css(); doc.head.appendChild(style); }
function addButton(doc) { if (!doc || doc.getElementById('awtsmoosCleanHudToggle')) return; const button = doc.createElement('button'); button.id = 'awtsmoosCleanHudToggle'; button.type = 'button'; button.textContent = '☰'; button.setAttribute('aria-label','Toggle full HUD'); button.onclick = () => doc.body.classList.toggle('awtsmoos-mobile-full-hud'); doc.body.appendChild(button); }
export function bootMobileCleanHud(scope = globalThis) { const doc = scope.document; if (!doc) return false; inject(doc); doc.body?.classList.add('awtsmoos-mobile-clean-hud'); addButton(doc); scope.__AWTSMOOS_MOBILE_CLEAN_HUD__ = { active:true, version:'world-first-pass-2' }; return true; }
if (globalThis.document?.readyState === 'loading') globalThis.addEventListener?.('DOMContentLoaded', () => bootMobileCleanHud(globalThis), { once:true }); else defer('mobile-clean-hud-boot', () => bootMobileCleanHud(globalThis), 0);
export default bootMobileCleanHud;
