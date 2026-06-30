/**
 * B"H
 * Adventure HUD: the campaign speaks while the fight moves.
 *
 * Damage cards tell the brawler truth. This panel tells the gate truth: where
 * you are, how many Sparks you found, how many Kelipos still block the exit, and
 * whether the hidden light was discovered.
 */
export function drawAdventureHud(ctx, state, w, h) {
  const run = state.adventureRun;
  if (!run || state.phase !== 'playing') return;
  const panelW = Math.min(420, w - 24);
  const x = Math.max(12, (w - panelW) / 2);
  const y = w < 760 ? 72 : 76;
  ctx.save();
  drawPanel(ctx, x, y, panelW, 74, run);
  drawText(ctx, x, y, panelW, run);
  drawMeters(ctx, x + 14, y + 52, panelW - 28, run);
  ctx.restore();
}

function drawPanel(ctx, x, y, w, h, run) {
  const pulse = run.pulse > 0 ? 0.22 : 0;
  ctx.fillStyle = `rgba(3,5,12,${0.76 + pulse})`;
  ctx.strokeStyle = run.enemiesLeft <= 0 ? '#84f7ff' : '#ffe082';
  ctx.lineWidth = run.pulse > 0 ? 3 : 1.5;
  round(ctx, x, y, w, h, 16);
  ctx.fill();
  ctx.stroke();
}

function drawText(ctx, x, y, w, run) {
  ctx.textAlign = 'left';
  ctx.fillStyle = '#84f7ff';
  ctx.font = '950 12px system-ui';
  ctx.fillText(`GATE ${run.gate} · ${run.name}`, x + 14, y + 19);
  ctx.fillStyle = '#fff3bf';
  ctx.font = '900 15px system-ui';
  ctx.fillText(status(run), x + 14, y + 40);
  ctx.textAlign = 'right';
  ctx.fillStyle = run.hiddenFound ? '#e9c4ff' : '#d8c995';
  ctx.font = '850 12px system-ui';
  ctx.fillText(`Hidden ${run.hiddenFound}/${run.hiddenTotal}`, x + w - 14, y + 19);
}

function drawMeters(ctx, x, y, w, run) {
  const sparkRatio = run.totalSparks ? run.sparks / run.totalSparks : 1;
  const enemyRatio = run.enemiesTotal ? 1 - run.enemiesLeft / run.enemiesTotal : 1;
  bar(ctx, x, y, w * 0.58, sparkRatio, '#84f7ff', `✦ ${run.sparks}/${run.totalSparks}`);
  bar(ctx, x + w * 0.62, y, w * 0.38, enemyRatio, '#ff8f7a', `${run.enemiesLeft} left`);
}

function status(run) {
  if (run.enemiesLeft <= 0) return `Exit open · ${run.lastPickup || run.objective}`;
  return run.lastPickup || run.objective;
}

function bar(ctx, x, y, w, ratio, color, label) {
  ctx.fillStyle = 'rgba(255,255,255,.12)';
  round(ctx, x, y, w, 10, 5); ctx.fill();
  ctx.fillStyle = color;
  round(ctx, x, y, Math.max(8, w * Math.max(0, Math.min(1, ratio))), 10, 5); ctx.fill();
  ctx.font = '800 10px system-ui'; ctx.fillStyle = '#fff8cf'; ctx.textAlign = 'center';
  ctx.fillText(label, x + w / 2, y + 24);
}

function round(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
}
