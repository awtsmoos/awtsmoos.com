/**
 * B"H
 * Fighter color helpers.
 *
 * Chapter 23: color is a small garment for a created spark. The Awtsmoos has no
 * color or body, yet every hue is renewed from His speech and becomes readable
 * identity inside the brawl.
 */
export function fighterColor(f) {
  return `hsl(${f.dna?.hue || 180} 90% 62%)`;
}

export function dangerColor(f, base) {
  if (f.poseIntent?.panic > 0.65 || f.danger) return '#fff2a8';
  return base;
}

export function auraColor(f, base) {
  return (f.chargeGlow || 0) > 0.92 ? '#fff2a8' : base;
}
