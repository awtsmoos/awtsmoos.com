/**
 * B"H
 * @module PlayerBodyParts
 *
 * Chapter 67: The traveler became a readable top-down RPG sprite.
 * The Awtsmoos has no body and no form; these body pieces reject awkward
 * mannequin bends and instead use stable pixel proportions, clear sleeves,
 * grounded shoes, and a calm walking cycle like the mockup's little hero.
 */
const COLORS = {
  shirt: '#1565c0', shirtDark: '#0b3b79', shirtLight: '#2b88d8',
  skin: '#ffd7a8', pants: '#172331', shoe: '#07080c'
};

export const drawShadow = (ctx, size) => {
  ctx.save();
  const g = ctx.createRadialGradient(0, size * .4, 0, 0, size * .4, size * .4);
  g.addColorStop(0, 'rgba(0,0,0,.38)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(0, size * .4, size * .33, size * .1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

export const drawLegs = (ctx, size, pose, cycle) => {
  const side = pose.view === 'side';
  const walk = cycle.leg * size * .045;
  ctx.fillStyle = COLORS.pants;
  if (side) {
    ctx.fillRect(-size * .07 + walk, size * .1, size * .13, size * .3);
    ctx.globalAlpha = .7;
    ctx.fillRect(-size * .04 - walk, size * .1, size * .11, size * .27);
    ctx.globalAlpha = 1;
    drawShoe(ctx, -size * .09 + walk, size * .38, size * .19, size);
    return;
  }
  ctx.fillRect(-size * .18 + walk, size * .1, size * .13, size * .29);
  ctx.fillRect(size * .05 - walk, size * .1, size * .13, size * .29);
  drawShoe(ctx, -size * .2 + walk, size * .37, size * .17, size);
  drawShoe(ctx, size * .03 - walk, size * .37, size * .17, size);
};

const drawShoe = (ctx, x, y, w, size) => {
  ctx.fillStyle = COLORS.shoe;
  ctx.fillRect(x, y, w, size * .06);
  ctx.fillStyle = 'rgba(255,255,255,.1)';
  ctx.fillRect(x + 1, y, w * .45, 1.5);
};

export const drawTorso = (ctx, size, pose, cycle) => {
  const side = pose.view === 'side';
  const back = pose.view === 'back';
  const w = side ? size * .36 : size * .48;
  const h = size * .48;
  ctx.save();
  ctx.scale(1, cycle.breath);
  const g = ctx.createLinearGradient(-w / 2, -size * .24, w / 2, size * .24);
  g.addColorStop(0, COLORS.shirtDark);
  g.addColorStop(.52, COLORS.shirtLight);
  g.addColorStop(1, COLORS.shirtDark);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.roundRect(-w / 2, -size * .27, w, h, size * .07);
  ctx.fill();
  ctx.fillStyle = back ? COLORS.shirtDark : '#e9fbff';
  if (side) ctx.fillRect(size * .02, -size * .24, size * .06, size * .4);
  else drawCollar(ctx, size);
  ctx.restore();
};

const drawCollar = (ctx, size) => {
  ctx.beginPath();
  ctx.moveTo(-size * .08, -size * .27);
  ctx.lineTo(0, -size * .18);
  ctx.lineTo(size * .08, -size * .27);
  ctx.closePath();
  ctx.fill();
};

export const drawArm = (ctx, size, pose, cycle, front) => {
  const side = pose.view === 'side';
  const walk = cycle.arm * size * .04;
  if (side) return drawSideArm(ctx, size, walk, front);
  const x = front ? size * .25 : -size * .25;
  const swing = (front ? -walk : walk);
  ctx.fillStyle = front ? COLORS.shirtLight : COLORS.shirtDark;
  ctx.fillRect(x - size * .045, -size * .21 + swing, size * .09, size * .3);
  ctx.fillStyle = COLORS.skin;
  ctx.fillRect(x - size * .035, size * .07 + swing, size * .07, size * .1);
};

const drawSideArm = (ctx, size, walk, front) => {
  const x = front ? size * .17 : -size * .08;
  ctx.globalAlpha = front ? 1 : .55;
  ctx.fillStyle = front ? COLORS.shirtLight : COLORS.shirtDark;
  ctx.fillRect(x - size * .04, -size * .21 - walk, size * .08, size * .3);
  ctx.fillStyle = COLORS.skin;
  ctx.fillRect(x - size * .03, size * .07 - walk, size * .06, size * .1);
  ctx.globalAlpha = 1;
};
