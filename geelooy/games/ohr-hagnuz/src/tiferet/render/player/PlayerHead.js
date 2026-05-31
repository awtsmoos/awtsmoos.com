/**
 * B"H
 * @module PlayerHead
 *
 * Chapter 68: The face stopped fighting the body.
 * The Awtsmoos has no body and no form; this head is simple, readable pixel art:
 * front, back, and side are separate truths, with kippah and hair held calmly
 * instead of a beard-mask twisting across the sprite.
 */
const SKIN = '#ffd7a8';
const SKIN_SHADE = '#e8b989';
const HAIR = '#10131a';
const BEARD = '#1a2028';

const side = pose => pose.view === 'side';
const back = pose => pose.view === 'back';

export const drawHead = (ctx, size, pose) => {
  ctx.save();
  ctx.translate(0, -size * .42);
  if (back(pose)) drawBackHead(ctx, size);
  else if (side(pose)) drawSideHead(ctx, size);
  else drawFrontHead(ctx, size);
  ctx.restore();
};

const drawFrontHead = (ctx, size) => {
  const w = size * .4;
  const h = size * .35;
  ctx.fillStyle = SKIN_SHADE;
  ctx.fillRect(-w / 2, -h / 2 + 3, w, h);
  ctx.fillStyle = SKIN;
  ctx.fillRect(-w / 2 + 2, -h / 2, w - 4, h - 3);
  drawHair(ctx, size, 0, false);
  ctx.fillStyle = '#17202b';
  ctx.fillRect(-size * .105, -size * .025, 4, 4);
  ctx.fillRect(size * .075, -size * .025, 4, 4);
  ctx.fillStyle = BEARD;
  ctx.fillRect(-size * .13, size * .075, size * .26, size * .1);
  ctx.fillStyle = '#fff1d6';
  ctx.fillRect(-size * .045, size * .092, size * .09, 2);
};

const drawSideHead = (ctx, size) => {
  const w = size * .34;
  const h = size * .34;
  ctx.fillStyle = SKIN_SHADE;
  ctx.fillRect(-w * .42, -h / 2 + 3, w, h);
  ctx.fillStyle = SKIN;
  ctx.fillRect(-w * .42 + 2, -h / 2, w - 4, h - 3);
  drawHair(ctx, size, size * .02, false);
  ctx.fillStyle = '#17202b';
  ctx.fillRect(size * .08, -size * .02, 4, 4);
  ctx.fillStyle = SKIN_SHADE;
  ctx.fillRect(size * .13, size * .03, size * .06, 3);
  ctx.fillStyle = BEARD;
  ctx.fillRect(-size * .02, size * .09, size * .16, size * .06);
};

const drawBackHead = (ctx, size) => {
  const w = size * .4;
  const h = size * .34;
  ctx.fillStyle = SKIN_SHADE;
  ctx.fillRect(-w / 2, -h / 2 + 3, w, h);
  ctx.fillStyle = SKIN;
  ctx.fillRect(-w / 2 + 2, -h / 2, w - 4, h - 3);
  drawHair(ctx, size, 0, true);
};

const drawHair = (ctx, size, x, isBack) => {
  ctx.fillStyle = HAIR;
  ctx.fillRect(x - size * .21, -size * .22, size * .42, size * .09);
  if (isBack) ctx.fillRect(x - size * .19, -size * .14, size * .38, size * .2);
  else {
    ctx.fillRect(x - size * .2, -size * .14, size * .07, size * .12);
    ctx.fillRect(x + size * .13, -size * .14, size * .07, size * .12);
  }
  ctx.fillStyle = '#05070d';
  ctx.beginPath();
  ctx.ellipse(x, -size * .25, size * .15, size * .05, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#3e5dff';
  ctx.lineWidth = 1;
  ctx.stroke();
};
