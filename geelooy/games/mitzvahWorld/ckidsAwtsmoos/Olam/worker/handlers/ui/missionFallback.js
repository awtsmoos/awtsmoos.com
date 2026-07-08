// B"H
/**
 * @file missionFallback.js
 * @description
 * Chapter 652: The mission card survives even when declarative UI is bypassed.
 *
 * The Awtsmoos sends mission light through `levelMission`. If the normal UI
 * vessel has not caught it yet, this fallback creates a small readable card and
 * dispatches the same event on the browser window.
 */
import { q } from './domKit.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

const safe = value => String(value ?? '').replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
const objectives = list => (Array.isArray(list) ? list : []).sort((a, b) => Number(a.uiOrder || 0) - Number(b.uiOrder || 0));

function ensureStyle() {
  if (document.getElementById('awtsmoos-mission-fallback-style')) return;
  const style = document.createElement('style');
  style.id = 'awtsmoos-mission-fallback-style';
  style.textContent = `.awtsmoos-mission-fallback{position:fixed;top:calc(74px + env(safe-area-inset-top));left:10px;z-index:22990;width:min(330px,calc(100vw - 74px));pointer-events:none;color:#fff4cf;font-family:Arial,sans-serif}.awtsmoos-mission-fallback-inner{padding:11px 13px;border-radius:18px;background:linear-gradient(180deg,rgba(42,27,12,.84),rgba(13,9,5,.76));border:1px solid rgba(255,218,122,.36);box-shadow:0 8px 22px rgba(0,0,0,.28)}.awtsmoos-mission-fallback h3{margin:2px 0 5px;font-size:17px}.awtsmoos-mission-fallback p{margin:5px 0;font-size:12px;line-height:1.25}.awtsmoos-mission-fallback ol{margin:8px 0 0 18px;padding:0;font-size:12px}.awtsmoos-mission-fallback small{display:block;margin-top:8px;color:#9effd0}`;
  document.head.appendChild(style);
}
function ensureCard() {
  ensureStyle();
  let host = q('levelMission') || document.querySelector('.awtsmoos-mission-fallback');
  if (host) return host;
  host = document.createElement('section');
  host.className = 'awtsmoos-mission-fallback';
  host.setAttribute('shaym', 'levelMission');
  document.body.appendChild(host);
  return host;
}
function objectiveHtml(item) { return `<li>${safe(item.label || item.id || item.type)}${Number(item.count || 0) > 1 ? ` ×${Number(item.count)}` : ''}</li>`; }

export function showMission(data = {}) {
  window.dispatchEvent(new CustomEvent('levelMission', { detail: data }));
  const host = ensureCard();
  const list = objectives(data.objectives).map(objectiveHtml).join('');
  host.innerHTML = `<div class="awtsmoos-mission-fallback-inner"><div style="font-size:10px;text-transform:uppercase;letter-spacing:.12em;color:#ffd978;font-weight:900">${safe(data.biome || 'Level')} ${safe(data.difficultyTier || '')}</div><h3>${safe(data.title || 'Mitzvah World')}</h3><p>${safe(data.missionText || data.description || 'Complete the mission.')}</p><ol>${list}</ol><small>${safe(data.hintText || 'Read the world carefully.')}</small></div>`;
}
