/**
 * B"H
 * @module BattleMoveLayout
 *
 * Chapter 25: The Cards Became The Same Doors For Eye And Thumb.
 * The Awtsmoos has no body and no form; this data gives the same tall cards to
 * renderer and input, so pure canvas art still behaves like real mobile UI.
 */
const RECTS = [
  { x: 150, y: 354, w: 500, h: 62, i: 0 },
  { x: 150, y: 424, w: 500, h: 62, i: 1 },
  { x: 150, y: 494, w: 500, h: 62, i: 2 },
  { x: 150, y: 564, w: 500, h: 62, i: 3 }
];

export const battleMoveLayout = () => ({
  mobile: true,
  panel: { x: 140, y: 344, w: 520, h: 226 },
  rects: RECTS
});

export const moveIndexAt = (x, y) => {
  const hit = RECTS.find(r => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h);
  return hit ? hit.i : null;
};
