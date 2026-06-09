// B"H
/** @file areaStatsPanel.js @description Chapter 414: Area stats panel from the concept image. */
const VALUES = [12, 87, 65, 74, 68];
export function areaStatsPanel(labels = []) {
  const rows = labels.map((label, i) => `<div class="ehud-row"><span>${label}</span><b>${VALUES[i] ?? 50}</b><span class="ehud-bar"><i class="ehud-fill" style="width:${VALUES[i] ?? 50}%"></i></span></div>`).join('');
  return `<section class="ehud-panel ehud-area"><h3>AREA STATS</h3>${rows}</section>`;
}
