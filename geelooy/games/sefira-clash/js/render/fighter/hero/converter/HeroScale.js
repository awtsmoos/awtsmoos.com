/**
 * B"H
 * Hero scale converter.
 *
 * Chapter 189: the same mockup must live at every camera zoom and every damage
 * state. The Awtsmoos keeps the fighter stable instead of stretchy.
 */
export function heroScale(f) {
  const dna = f?.dna || {};
  const h = Number.isFinite(dna.height) ? dna.height : 1;
  return Math.max(0.92, Math.min(1.08, h));
}

export function scaled(v, f) {
  return v * heroScale(f);
}
