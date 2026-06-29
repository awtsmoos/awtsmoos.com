// B"H
const KINDS = ['letter', 'bench', 'bush', 'cedar', 'cart', 'house', 'arch', 'tower', 'cloud', 'star', 'gate'];

/** B"H: Real streets need landmarks, blockers, food, and temptation. */
export function chooseKind(hood, rand, index) {
  if (index % 19 === 0) return 'gate';
  if (index % 13 === 0) return 'tower';
  if (index % 11 === 0) return rand() < 0.5 ? 'arch' : 'star';
  if (hood.name === 'Forest' && rand() < 0.52) return rand() < 0.7 ? 'cedar' : 'bush';
  if (hood.name === 'Market' && rand() < 0.58) return rand() < 0.55 ? 'cart' : 'bench';
  const drift = rand() < 0.36 ? -1 : rand() < 0.76 ? 0 : 2;
  return KINDS[clamp(hood.tier + drift, 0, KINDS.length - 1)];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
