/**
 * B"H
 * Data-only AI souls.
 *
 * Chapter 4: six bots stand beneath the storm. Each receives a small vessel of
 * will: hunger, fear, patience, cruelty, greed, and edge-love. The Awtsmoos
 * makes them distinct without randomness or heavy learning machinery.
 */
export const AI_PERSONALITIES = Object.freeze([
  trait('Aggressive', 1.28, 0.82, 1.08, 0.9, 0.95, 1.1, 'hunts center brawls'),
  trait('Defensive', 0.78, 1.28, 0.82, 1.18, 1.08, 0.92, 'survives and disengages'),
  trait('Trickster', 0.96, 1.02, 1.22, 1.05, 1.14, 1.0, 'baits and feints'),
  trait('Predator', 1.08, 0.94, 1.0, 0.96, 0.92, 1.38, 'edge guards heavily'),
  trait('Berserker', 1.45, 0.66, 1.16, 0.72, 0.8, 1.08, 'ignores safety for kills'),
  trait('Coward', 0.62, 1.48, 0.86, 1.34, 1.2, 0.76, 'runs when damaged')
]);

export function personalityByIndex(index = 0) {
  return AI_PERSONALITIES[((index % AI_PERSONALITIES.length) + AI_PERSONALITIES.length) % AI_PERSONALITIES.length];
}

function trait(name, aggression, survival, bait, retreat, resource, edgeGuard, note) {
  return Object.freeze({ name, aggression, survival, bait, retreat, resource, edgeGuard, note });
}
