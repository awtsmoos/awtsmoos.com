// B"H
const KINDS = ['letter', 'bench', 'bush', 'cedar', 'cart', 'house', 'arch', 'tower', 'cloud', 'star', 'gate'];

/** B"H: Rare giant vessels are rare again; common life fills the streets. */
export function chooseKind(hood, rand, index) {
  const drift = rand() < 0.68 ? -2 : rand() < 0.9 ? -1 : 1;
  const gatePenalty = index % 7 ? -1 : 0;
  const tier = clamp(hood.tier + drift + gatePenalty, 0, KINDS.length - 1);
  return KINDS[tier];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
