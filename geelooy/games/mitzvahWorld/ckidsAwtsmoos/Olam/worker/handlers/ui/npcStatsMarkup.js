// B"H
/**
 * @file npcStatsMarkup.js
 * @description Chapter 262: The NPC stats panel becomes its own parchment,
 * where each middah receives a measured bar.
 */
import { esc } from './domKit.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
const DEFAULT_STATS = Object.freeze({ wisdom: 12, kindness: 14, courage: 10, trade: 7, growth: 16 });
export function statsHtml(data = {}) {
  const stats = data.npcStats || data.areaStats || DEFAULT_STATS;
  const rows = Object.entries(stats).slice(0, 7).map(([name, value]) => {
    const safe = Math.max(0, Math.min(30, Number(value) || 0));
    return `<div class="awts-stat-row"><span>${esc(name)}</span><b>${safe}</b><span class="awts-stat-bar"><i class="awts-stat-fill" style="width:${Math.round(safe / 30 * 100)}%"></i></span></div>`;
  }).join('');
  return `<aside class="awts-npc-stats"><strong>${esc(data.areaName || 'Entry Village')}</strong>${rows}<div class="awts-area-note">${esc(data.areaNote || 'NPC stats are drawn from this area and guide what opens next.')}</div></aside>`;
}
