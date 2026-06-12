/**
 * B"H
 * Map personality derivation.
 *
 * Chapter 56: each arena receives a temperament. Geometry becomes character:
 * chaos, verticality, aggression, recovery mercy, item hunger, objective pull.
 */
export function deriveMapPersonality(map) {
  const id = map.id || '';
  const rules = map.rules || {};
  const platforms = map.platforms || [];
  const verticality = spreadY(platforms) / 240;
  const width = Math.max(1, map.bounds.right - map.bounds.left);
  const density = platforms.reduce((n, p) => n + p.w, 0) / width;
  const chaos = (rules.wallBounce ? 4 : 0) + (map.walls?.length || 0) * 0.4 + (map.holes?.length || 0) * 1.5;
  return clampTraits({
    aggression: hint(id, ['pinball','forge','battlefield','throne'], 7, 5) + density,
    verticality: verticality + hint(id, ['tower','tree','gate','heichal'], 4, 2),
    chaos: chaos + hint(id, ['pinball','rift','abyss','echo'], 5, 1.5),
    recoveryDifficulty: hint(id, ['abyss','rift','pinball'], 7, 4) + (map.holes?.length || 0),
    itemDensity: Math.min(10, (map.powerupSpawns?.length || 0) * 1.2 + 3),
    objectivePressure: hint(id, ['vast','meadow','causeway','temple'], 7, 4)
  });
}

function spreadY(platforms) {
  if (!platforms.length) return 0;
  const ys = platforms.map(p => p.y);
  return Math.max(...ys) - Math.min(...ys);
}
function hint(id, words, yes, no) { return words.some(w => id.includes(w)) ? yes : no; }
function clampTraits(t) { for (const k of Object.keys(t)) t[k] = Math.round(Math.max(0, Math.min(10, t[k]))); return Object.freeze(t); }
