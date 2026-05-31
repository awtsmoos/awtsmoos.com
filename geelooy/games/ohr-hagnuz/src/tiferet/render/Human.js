/**
 * B"H
 * @module Human
 *
 * Chapter 57: The villagers received kinder proportions.
 * The Awtsmoos has no body and no form; every NPC is still generated from
 * canvas primitives, but now the face, kippah, shirt, shoes, and idle bob feel
 * like inhabitants of the same polished world as the player.
 */
export class Human {
  static draw(ctx, x, y, size, progress = 0, dir = 'd') {
    const phase = Math.sin(progress * Math.PI * 2);
    const bob = Math.abs(phase) * size * .035;
    ctx.save();
    ctx.translate(x + size / 2, y + size / 2 - bob);
    drawShadow(ctx, size);
    drawLegs(ctx, size, phase);
    drawBody(ctx, size, dir);
    drawArms(ctx, size, phase);
    drawHead(ctx, size, dir);
    ctx.restore();
  }
}

const drawShadow = (ctx, size) => {
  ctx.fillStyle = 'rgba(0,0,0,.34)';
  ctx.beginPath();
  ctx.ellipse(0, size * .42, size * .3, size * .09, 0, 0, Math.PI * 2);
  ctx.fill();
};

const drawLegs = (ctx, size, phase) => {
  const swing = phase * size * .04;
  ctx.fillStyle = '#1a2533';
  ctx.fillRect(-size * .16 + swing, size * .08, size * .11, size * .28);
  ctx.fillRect(size * .05 - swing, size * .08, size * .11, size * .28);
  ctx.fillStyle = '#08090d';
  ctx.fillRect(-size * .18 + swing, size * .35, size * .16, size * .055);
  ctx.fillRect(size * .03 - swing, size * .35, size * .16, size * .055);
};

const drawBody = (ctx, size, dir) => {
  const back = dir === 'u';
  const g = ctx.createLinearGradient(-size * .23, -size * .22, size * .23, size * .22);
  g.addColorStop(0, '#0d4e91');
  g.addColorStop(.55, '#2586d7');
  g.addColorStop(1, '#0a3768');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.roundRect(-size * .24, -size * .25, size * .48, size * .44, size * .075);
  ctx.fill();
  ctx.fillStyle = back ? '#0b3b79' : '#e8fbff';
  ctx.beginPath();
  ctx.moveTo(-size * .08, -size * .25);
  ctx.lineTo(0, -size * .16);
  ctx.lineTo(size * .08, -size * .25);
  ctx.closePath();
  ctx.fill();
};

const drawArms = (ctx, size, phase) => {
  [-1, 1].forEach((side, i) => {
    const swing = phase * size * .04 * (i ? -1 : 1);
    ctx.fillStyle = '#0d4e91';
    ctx.fillRect(side * size * .24 - size * .045, -size * .2 + swing, size * .09, size * .29);
    ctx.fillStyle = '#ffd7a8';
    ctx.fillRect(side * size * .24 - size * .036, size * .07 + swing, size * .072, size * .12);
  });
};

const drawHead = (ctx, size, dir) => {
  const back = dir === 'u';
  ctx.fillStyle = '#ffd7a8';
  ctx.fillRect(-size * .19, -size * .53, size * .38, size * .31);
  ctx.fillStyle = '#11151c';
  ctx.fillRect(-size * .21, -size * .56, size * .42, size * .09);
  if (back) ctx.fillRect(-size * .18, -size * .48, size * .36, size * .18);
  ctx.fillStyle = '#05070d';
  ctx.beginPath();
  ctx.ellipse(0, -size * .58, size * .14, size * .045, 0, 0, Math.PI * 2);
  ctx.fill();
  if (back) return;
  ctx.fillStyle = '#17202b';
  ctx.fillRect(-size * .09, -size * .39, 3, 3);
  ctx.fillRect(size * .08, -size * .39, 3, 3);
};
