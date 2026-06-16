/**
 * B"H
 * V3 character style.
 *
 * Chapter 226: the Awtsmoos forms one readable hero covenant: tall, calm,
 * sculpted, never a broken circle puppet.
 */
export const V3_STYLE = Object.freeze({
  height: 178,
  shoulder: 78,
  hip: 32,
  head: Object.freeze({ rx: 22, ry: 24 }),
  neck: Object.freeze({ w: 16, h: 25 }),
  torso: Object.freeze({ top: 78, waist: 30, h: 72 }),
  arm: Object.freeze({ upper: 14, lower: 11 }),
  leg: Object.freeze({ thigh: 15, shin: 12 }),
  glove: Object.freeze({ rx: 10.5, ry: 10 }),
  boot: Object.freeze({ rx: 18, ry: 7 }),
  ring: Object.freeze({ rx: 35, ry: 6 })
});

export function material(color) {
  return { accent: color, shell: 'rgba(2,3,7,1)', soft: 'rgba(8,10,15,.98)', ink: 'rgba(0,0,0,.92)', glint: 'rgba(255,255,255,.72)' };
}
