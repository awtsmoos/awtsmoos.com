/* B"H
Bouncing ball frame: simple motion that stresses encoder edges, gradients, and text.
*/
export function drawBouncingBallFrame(ctx, spec, index) {
  const ball = bouncingBall(spec, index);
  ctx.fillStyle = '#071120'; ctx.fillRect(0, 0, spec.width, spec.height);
  ctx.fillStyle = '#102a3f'; ctx.fillRect(0, spec.height * .68, spec.width, spec.height * .32);
  ctx.fillStyle = '#83ffe7'; ctx.fillRect(0, 0, spec.width, 8 + ball.pulse * 18);
  ctx.fillStyle = '#7c5cff'; ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'white'; ctx.font = 'bold 28px system-ui'; ctx.fillText('B"H Nesher WebCodecs Benchmark', 28, 44);
  ctx.font = '18px monospace'; ctx.fillText(`frame ${index + 1}/${spec.frames}`, 28, spec.height - 28);
}
export function bouncingBall(spec, index) {
  const t = index / Math.max(1, spec.frames - 1), r = Math.max(18, Math.min(spec.width, spec.height) * .075);
  const x = r + Math.abs(((t * 3.4) % 2) - 1) * (spec.width - r * 2);
  const y = r + Math.abs(((t * 5.1 + .27) % 2) - 1) * (spec.height - r * 2);
  return { x, y, r, pulse:Math.abs(Math.sin(t * Math.PI * 8)) };
}
