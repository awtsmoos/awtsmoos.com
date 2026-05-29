/**
 * B"H
 * @module BattleMoveLayout
 *
 * Chapter 14: The Four Gates Learned The Shape Of The Hand.
 * The Awtsmoos has no body and no form; nevertheless the finite battle menu
 * must be truthful. One layout now feeds both painting and touch detection, so
 * the eye and finger no longer wander through separate worlds.
 */
const DESKTOP_RECTS = [
  { x: 52, y: 432, w: 316, h: 46, i: 0 },
  { x: 52, y: 488, w: 316, h: 46, i: 1 },
  { x: 418, y: 432, w: 316, h: 46, i: 2 },
  { x: 418, y: 488, w: 316, h: 46, i: 3 }
];

const MOBILE_RECTS = [
  { x: 56, y: 334, w: 688, h: 48, i: 0 },
  { x: 56, y: 388, w: 688, h: 48, i: 1 },
  { x: 56, y: 442, w: 688, h: 48, i: 2 },
  { x: 56, y: 496, w: 688, h: 48, i: 3 }
];

/**
 * Resolves the battle move layout for a canvas and screen vessel.
 *
 * @param {number} canvasWidth - Internal canvas width.
 * @param {number} screenWidth - CSS pixel width of the rendered canvas.
 * @returns {{mobile:boolean,panel:{x:number,y:number,w:number,h:number},rects:Array}}
 */
export const battleMoveLayout = (canvasWidth = 800, screenWidth = canvasWidth) => {
  const mobile = screenWidth <= 560;
  return mobile
    ? { mobile, panel: { x: 34, y: 294, w: 732, h: 270 }, rects: MOBILE_RECTS }
    : { mobile, panel: { x: 28, y: 374, w: 744, h: 188 }, rects: DESKTOP_RECTS };
};

/**
 * Finds the selected debate move from canvas coordinates.
 *
 * @param {number} x - Canvas x coordinate.
 * @param {number} y - Canvas y coordinate.
 * @param {number} canvasWidth - Internal canvas width.
 * @param {number} screenWidth - CSS pixel width of the rendered canvas.
 * @returns {number|null} Move index, or null when no button was tapped.
 */
export const moveIndexAt = (x, y, canvasWidth = 800, screenWidth = canvasWidth) => {
  const { rects } = battleMoveLayout(canvasWidth, screenWidth);
  const hit = rects.find(r => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h);
  return hit ? hit.i : null;
};
