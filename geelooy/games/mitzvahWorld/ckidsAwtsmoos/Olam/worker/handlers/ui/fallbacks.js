// B"H
/**
 * @file fallbacks.js
 * @description Direct UI fallback surfaces. Includes a main-thread NPC target
 * frame because worker-side selection cannot create DOM directly.
 */
import { directFallbackMap } from './directFallbackMap.js?compact=true&v=village-polish-20260612-bh810';
import { handleEffectsFallback } from './effectsFallback.js?compact=true&v=lava-camera-axis-20260609-bh640';
import { handleEmeraldAudioFallback } from './emeraldAudioFallback.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { handleEmeraldCameraFallback } from './emeraldCameraFallback.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { handleEmeraldHudFallback } from './emeraldHudFallback.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { handleEmeraldQuestFallback } from './emeraldQuestFallback.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { handleHudFallback } from './hudFallback.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { dispatchInventory } from './inventoryFallback.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { handleNpcPortraitFallback } from './npcPortraitFallback.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { openShopOverlay } from './shopOverlay.js?compact=true&v=npc-scroll-pass-through-20260609-bh638';
export { dispatchInventory };
const FRAME_ID = 'awts-friendly-target-frame';
function esc(v=''){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function ensureTargetStyle(){if(typeof document==='undefined')return;let s=document.getElementById(`${FRAME_ID}-style`);if(!s){s=document.createElement('style');s.id=`${FRAME_ID}-style`;document.head.appendChild(s);}s.textContent=`#${FRAME_ID}{position:fixed;left:22px;top:max(96px,calc(env(safe-area-inset-top) + 96px));z-index:2147483200;width:min(330px,calc(100vw - 44px));padding:9px 12px 10px;border-radius:18px;background:linear-gradient(145deg,rgba(8,13,23,.92),rgba(5,8,7,.86));border:2px solid rgba(255,220,90,.92);box-shadow:0 12px 26px rgba(0,0,0,.42),inset 0 1px rgba(255,255,255,.1);font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#fff;text-shadow:0 2px 4px #000;pointer-events:none}.awts-target-title{display:flex;align-items:center;gap:10px;font-weight:900;font-size:15px;line-height:1.1}.awts-target-portrait{width:36px;height:36px;min-width:36px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 35% 25%,#fff7b3,#966b18 70%);border:2px solid rgba(255,235,146,.92);color:#1b1100;text-shadow:none}.awts-target-readout{min-width:0;flex:1}.awts-target-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.awts-target-sub{font-size:11px;opacity:.86;margin-top:2px}.awts-target-bar{height:12px;border-radius:999px;overflow:hidden;background:rgba(255,255,255,.14);border:1px solid rgba(0,0,0,.35);margin-top:7px}.awts-target-fill{height:100%;background:linear-gradient(90deg,#277a35,#58dc72 65%,#9cffaa)}.awts-target-hint{font-size:11px;opacity:.92;margin-top:4px;color:#ffe28a}#${FRAME_ID}.hidden{display:none!important}`;}
function showTargetFrame(ob={}){if(typeof document==='undefined')return;ensureTargetStyle();let el=document.getElementById(FRAME_ID);if(!el){el=document.createElement('div');el.id=FRAME_ID;document.body.appendChild(el);}const hp=Number(ob.hp??100),max=Math.max(1,Number(ob.maxHp??ob.max??100)),pct=Math.max(0,Math.min(100,hp/max*100));el.classList.remove('hidden');el.innerHTML=`<div class="awts-target-title"><div class="awts-target-portrait">ח</div><div class="awts-target-readout"><div class="awts-target-name">${esc(ob.name||ob.npcName||'Friendly NPC')}</div><div class="awts-target-sub">${esc(ob.type||'friendly-npc')}${Number.isFinite(Number(ob.distance))?` · ${Number(ob.distance).toFixed(1)}m`:''}</div></div></div><div class="awts-target-bar"><div class="awts-target-fill" style="width:${pct}%"></div></div><div class="awts-target-hint">${esc(ob.hint||'Target selected — tap again to talk')}</div>`;window.__AWTSMOOS_TARGET_FRAME_PROOF__={at:Date.now(),frameVisible:true,name:ob.name,hp,max,position:'top-left-beside-health',source:'main-thread-fallback'};}
function clearTargetFrame(){if(typeof document==='undefined')return;document.getElementById(FRAME_ID)?.classList.add('hidden');window.__AWTSMOOS_TARGET_FRAME_PROOF__={at:Date.now(),frameVisible:false,source:'main-thread-fallback'};}
export function directFallback(manager, shaym, ob = {}) {
  if (shaym === 'targetFrame') showTargetFrame(ob);
  if (shaym === 'clearTargetFrame') clearTargetFrame();
  handleHudFallback(shaym, ob);
  handleEmeraldHudFallback(shaym, ob);
  handleEmeraldQuestFallback(shaym, ob);
  handleNpcPortraitFallback(shaym, ob);
  handleEmeraldCameraFallback(shaym, ob);
  handleEmeraldAudioFallback(shaym, ob);
  if (shaym === 'storeScreen' && ob?.open) openShopOverlay(manager, ob.open, ob.open.mode || 'buy');
  handleEffectsFallback(manager, shaym, ob);
  directFallbackMap(manager, ob)[shaym]?.();
}
