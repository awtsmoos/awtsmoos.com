/**
 * B"H
 * Power-up renderer.
 *
 * Chapter 17: little letters float like coins of light, clear enough to chase
 * mid-fight and cheap enough to draw during an eight-fighter storm.
 */
export function drawPowerups(ctx, powerups) {
  for (let i = 0; i < powerups.length; i++) {
    const p = powerups[i];
    if (!p.active) continue;
    const y = p.y + Math.sin(p.bob) * 9;
    ctx.globalAlpha = 0.92;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, y, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.font = '900 24px serif';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#09030d';
    ctx.lineWidth = 5;
    ctx.strokeText(p.letter, p.x, y + 8);
    ctx.fillStyle = '#fffdf0';
    ctx.fillText(p.letter, p.x, y + 8);
  }
}
