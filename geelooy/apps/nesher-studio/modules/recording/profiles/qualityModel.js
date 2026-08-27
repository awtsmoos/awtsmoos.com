/* B"H
Quality model: speed and beauty are weighed without breaking the stable recorder gate.
*/
export function qualityScore(profile = {}) {
  const queue = Math.max(1, Number(profile.maxQueue || 1));
  const scale = Number(profile.bitrateScale || 1);
  const codecBonus = String(profile.codec || '').startsWith('vp09') ? 2 : 1;
  return Math.round((scale * 10 + codecBonus) / queue);
}
export function speedScore(profile = {}) {
  const queue = Math.max(1, Number(profile.maxQueue || 1));
  const codec = String(profile.codec || 'vp8');
  const base = codec.startsWith('vp8') ? 10 : codec.startsWith('vp09') ? 7 : 4;
  return Math.max(1, base - queue + Number(profile.catchUpFrames || 0));
}
