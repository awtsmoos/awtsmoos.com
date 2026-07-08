// B"H
/**
 * @file npcPortraitMarkup.js
 * @description A World-of-Wonders portrait vessel for NPC speech.
 */
import { esc } from './domKit.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
function initials(name = 'NPC') { return String(name).split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase() || '').join('') || 'NPC'; }
function portraitData(data = {}) {
  const p = data.portrait || {};
  const name = p.name || data.npcName || data.fromNpc || data.title || 'Village Guide';
  return { name, title:p.title || data.title || name, subtitle:p.subtitle || data.areaName || data.role || 'Friendly NPC', image:p.image || p.url || data.portraitUrl || '', emoji:p.emoji || '🕍', initials:p.initials || initials(name), level:p.level || data.level || '??' };
}
export function portraitHtml(data = {}) {
  const p = portraitData(data);
  const face = p.image ? `<img class="awts-npc-portrait-img" src="${esc(p.image)}" alt="${esc(p.name)} portrait">` : `<span class="awts-npc-portrait-emoji" aria-hidden="true">${esc(p.emoji)}</span><strong>${esc(p.initials)}</strong>`;
  return `<aside class="awts-npc-portrait" aria-label="${esc(p.name)} portrait"><div class="awts-npc-portrait-ring"><div class="awts-npc-portrait-face">${face}</div><span class="awts-npc-portrait-level">Lv ${esc(p.level)}</span></div><div class="awts-npc-portrait-name">${esc(p.name)}</div><div class="awts-npc-portrait-subtitle">${esc(p.subtitle)}</div></aside>`;
}
export default portraitHtml;
