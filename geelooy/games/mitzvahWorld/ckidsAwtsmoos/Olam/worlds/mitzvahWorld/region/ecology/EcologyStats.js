// B"H
/**
 * @file EcologyStats.js
 * @description Chapter 981: compact proof that the invisible land exists.
 */
const fields = ["moisture", "fertility", "traffic", "shade", "sunlight", "altitude", "slope"];

export function summarizeEcology(cells = []) {
  const byBiome = {};
  const numeric = Object.fromEntries(fields.map(f => [f, { min: 1, max: 0, sum: 0 }]));
  for (const cell of cells) {
    byBiome[cell.biome] = (byBiome[cell.biome] || 0) + 1;
    for (const f of fields) {
      const v = Number(cell[f]) || 0;
      numeric[f].min = Math.min(numeric[f].min, v);
      numeric[f].max = Math.max(numeric[f].max, v);
      numeric[f].sum += v;
    }
  }
  const count = cells.length || 1;
  const averages = Object.fromEntries(fields.map(f => [f, round(numeric[f].sum / count)]));
  const ranges = Object.fromEntries(fields.map(f => [f, { min: round(numeric[f].min), max: round(numeric[f].max) }]));
  return { cells: cells.length, byBiome, averages, ranges };
}

function round(v) { return Math.round((Number(v) || 0) * 1000) / 1000; }
