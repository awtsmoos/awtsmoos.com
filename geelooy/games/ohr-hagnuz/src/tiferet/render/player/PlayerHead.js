/**
 * B"H
 * @module PlayerHead
 *
 * Chapter 8: The Face Turned Away And Became A Back, Not A Mask Rotated.
 * The Awtsmoos has no body and no form; the traveler is finite, so each view
 * gets its own visible truth: front eyes, side nose, back hair and kippah.
 */
const SKIN = '#ffdbac';
const HAIR = '#2d2d2d';

/** @param {CanvasRenderingContext2D} ctx @param {number} size @param {object} pose @returns {void} */
const drawHeadShape = (ctx, size, pose) => {
  const side = pose.view.includes('Side');
  const x = side ? pose.mirror * size / 14 : 0;
  ctx.fillStyle = SKIN;
  ctx.beginPath();
  ctx.ellipse(x, 0, side ? size / 5.6 : size / 5, size / 5.45, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-size / 15, size / 6, size / 7.5, size / 8);
};

/** @param {CanvasRenderingContext2D} ctx @param {number} size @param {object} pose @returns {void} */
const drawKippahAndHair = (ctx, size, pose) => {
  const back = pose.view.startsWith('back');
  ctx.fillStyle = back ? HAIR : '#1a1a1a';
  ctx.beginPath();
  ctx.ellipse(0, -size / 6, size / 4.3, size / 10, 0, 0, Math.PI * 2);
  ctx.fill();
  if (!back) return;
  ctx.fillStyle = HAIR;
  [-1, 1].forEach(side => {
    ctx.beginPath();
    ctx.ellipse(side * size / 5.5, -size / 20, size / 18, size / 7, side * 0.18, 0, Math.PI * 2);
    ctx.fill();
  });
};

/** @param {CanvasRenderingContext2D} ctx @param {number} size @param {object} pose @returns {void} */
const drawFace = (ctx, size, pose) => {
  const side = pose.view.includes('Side');
  if (pose.view.startsWith('back')) return;
  ctx.fillStyle = '#333';
  if (side) {
    const mx = pose.mirror;
    ctx.beginPath();
    ctx.ellipse(mx * size / 7, -size / 35, 2.3, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e8c4a0';
    ctx.beginPath();
    ctx.ellipse(mx * size / 4.8, size / 26, size / 26, size / 18, 0, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  ctx.fillRect(-size / 8 - 2, -size / 35, 4, 3);
  ctx.fillRect(size / 8 - 2, -size / 35, 4, 3);
  ctx.fillStyle = '#e8c4a0';
  ctx.beginPath();
  ctx.ellipse(0, size / 20, size / 25, size / 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#a67c52';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, size / 10, size / 15, 0.1, Math.PI - 0.1);
  ctx.stroke();
};

/** @param {CanvasRenderingContext2D} ctx @param {number} size @returns {void} */
const drawBeard = (ctx, size) => {
  ctx.fillStyle = HAIR;
  ctx.beginPath();
  ctx.moveTo(-size / 6, size / 15);
  ctx.quadraticCurveTo(-size / 8, size / 4, 0, size / 3);
  ctx.quadraticCurveTo(size / 8, size / 4, size / 6, size / 15);
  ctx.quadraticCurveTo(0, size / 8, -size / 6, size / 15);
  ctx.fill();
};

/**
 * Draws a true directional head, never a rotated front face.
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 * @param {number} size - Tile size.
 * @param {object} pose - Resolved pose.
 * @returns {void}
 */
export const drawHead = (ctx, size, pose) => {
  ctx.save();
  ctx.translate(0, -size / 2.5);
  drawHeadShape(ctx, size, pose);
  drawKippahAndHair(ctx, size, pose);
  drawFace(ctx, size, pose);
  if (pose.view === 'front') drawBeard(ctx, size);
  ctx.restore();
};
