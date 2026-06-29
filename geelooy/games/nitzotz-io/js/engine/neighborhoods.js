// B"H
const HOODS = ['Plaza', 'Forest', 'Market', 'Courtyard', 'Tower', 'Sky', 'Outer'];

/** B"H: A neighborhood is a mood, not permission for visual anarchy. */
export function hoodFor(key) {
  const [x, y] = key.split(',').map(Number);
  const n = Math.abs(x * 3 + y * 5) % HOODS.length;
  const distance = Math.abs(x) + Math.abs(y);
  return { name: HOODS[n], tier: Math.max(0, Math.min(8, distance + (n % 2))) };
}
