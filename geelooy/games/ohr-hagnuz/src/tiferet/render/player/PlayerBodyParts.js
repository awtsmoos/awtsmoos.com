/**
 * B"H
 * @module PlayerBodyParts
 *
 * Chapter 7: Shoulders, Sleeves, Feet, And The Secret Of A True Silhouette.
 * The Awtsmoos has no body and no form; still, every finite pixel receives a
 * truthful contour. Side is narrow, back hides the face, front reveals it.
 */
const COLORS = { shirt: '#1565c0', skin: '#ffdbac', pants: '#1e2430', shoe: '#2d2d2d' };

/** @param {CanvasRenderingContext2D} ctx @param {number} size @returns {void} */
export const drawShadow = (ctx, size) => {
  ctx.save();
  ctx.globalAlpha = 0.32;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(0, size / 2.45, size / 3.1, size / 8.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

/** @param {CanvasRenderingContext2D} ctx @param {number} size @param {object} pose @param {object} cycle @returns {void} */
export const drawLegs = (ctx, size, pose, cycle) => {
  const side = pose.view.includes('Side');
  const swing = cycle.leg * size / 13;
  ctx.fillStyle = COLORS.pants;
  if (side) {
    ctx.fillRect(-size / 11, size / 8 + swing / 3, size / 6, size / 3.2);
    ctx.globalAlpha = 0.62;
    ctx.fillRect(-size / 12, size / 10 - swing / 3, size / 7, size / 3.4);
    ctx.globalAlpha = 1;
    ctx.fillStyle = COLORS.shoe;
    ctx.fillRect(-size / 10, size / 2.35, size / 4.2, size / 12);
    return;
  }
  ctx.fillRect(-size / 4.8 + swing, size / 8, size / 7, size / 3.2);
  ctx.fillRect(size / 12 - swing, size / 8, size / 7, size / 3.2);
  ctx.fillStyle = COLORS.shoe;
  ctx.fillRect(-size / 4.6 + swing, size / 2.35, size / 5.8, size / 11);
  ctx.fillRect(size / 12 - swing, size / 2.35, size / 5.8, size / 11);
};

/** @param {CanvasRenderingContext2D} ctx @param {number} size @param {object} pose @param {object} cycle @returns {void} */
export const drawTorso = (ctx, size, pose, cycle) => {
  const side = pose.view.includes('Side');
  const back = pose.view.startsWith('back');
  const torsoW = side ? size / 3.4 : size / 2.12;
  ctx.save();
  ctx.scale(1, cycle.breath);
  ctx.fillStyle = COLORS.shirt;
  ctx.beginPath();
  ctx.roundRect(-torsoW / 2, -size / 4, torsoW, size / 2, size / 12);
  ctx.fill();
  ctx.fillStyle = back ? '#0d47a1' : '#fff';
  if (side) ctx.fillRect(pose.mirror * size / 16 - size / 24, -size / 4, size / 12, size / 2.2);
  else {
    ctx.beginPath();
    ctx.moveTo(-size / 10, -size / 4);
    ctx.lineTo(0, -size / 6);
    ctx.lineTo(size / 10, -size / 4);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
};

/** @param {CanvasRenderingContext2D} ctx @param {number} size @param {object} pose @param {object} cycle @param {boolean} front @returns {void} */
export const drawArm = (ctx, size, pose, cycle, front) => {
  const side = pose.view.includes('Side');
  const x = side ? pose.mirror * size / 7 : (front ? size / 4.5 : -size / 4.5);
  const swing = (front ? -cycle.arm : cycle.arm) * size / 12;
  ctx.save();
  ctx.translate(x, -size / 8 + swing / 4);
  ctx.rotate(side ? pose.mirror * 0.12 : (front ? 0.26 : -0.26));
  ctx.globalAlpha = !front && side ? 0.48 : 1;
  ctx.fillStyle = COLORS.shirt;
  ctx.fillRect(-size / 22, -size / 7, size / 11, size / 3.2);
  ctx.fillStyle = COLORS.skin;
  ctx.fillRect(-size / 28, size / 12, size / 14, size / 5.2);
  if (front) {
    ctx.beginPath();
    ctx.arc(0, size / 3.7, size / 13, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
};
