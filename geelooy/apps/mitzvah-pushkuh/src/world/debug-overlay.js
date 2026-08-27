// B"H
// Compatibility shim: debug overlay now lives in debug/.
export function drawDebug(ctx, data) {
  if (!data?.enabled) return; ctx.save(); ctx.globalCompositeOperation = "source-over"; ctx.fillStyle = "#000a"; ctx.fillRect(8, 8, 168, 70);
  ctx.fillStyle = "#8feaff"; ctx.font = "12px monospace"; ctx.fillText(`fps ${data.fps} tier ${data.tier}`, 16, 28); ctx.fillText(`dpr ${data.dpr} avg ${data.avg}`, 16, 46); ctx.fillText(`backend ${data.backend || "canvas"}`, 16, 64); ctx.restore();
}
