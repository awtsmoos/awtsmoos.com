/* B"H
Source rendering: image, video, browser plate, audio plate, and visualizer each reveal form.
Crop is applied at draw time, so the original media remains whole.
*/
import { renderAudioVisualizer } from '../visualizer/renderAudioVisualizer.js';

export function renderSource(ctx, source) {
  if (!source.visible) return;
  ctx.save(); applyTransform(ctx, source); ctx.globalAlpha *= source.stopped ? .35 : source.opacity ?? 1;
  try { drawByType(ctx, source); } catch { drawMissing(ctx, source); }
  ctx.restore();
}

function applyTransform(ctx, source) {
  const cx = source.x + source.w / 2; const cy = source.y + source.h / 2;
  ctx.translate(cx, cy); ctx.rotate((source.rotation || 0) * Math.PI / 180); ctx.translate(-source.w / 2, -source.h / 2);
}
function drawByType(ctx, source) {
  if (source.type === 'livestreamVisualizer') return renderAudioVisualizer(ctx, source);
  if (source.audioOnly || ['audioFile','audioInput','displayAudio'].includes(source.type)) return drawAudioPlate(ctx, source);
  if (source.type === 'browser' || source.type === 'iframe') return drawBrowserPlate(ctx, source);
  if (source.node) return drawCroppedMedia(ctx, source);
  drawMissing(ctx, source);
}
function drawCroppedMedia(ctx, source) {
  const rect = mediaRect(source);
  ctx.drawImage(source.node, rect.sx, rect.sy, rect.sw, rect.sh, 0, 0, source.w, source.h);
}
export function mediaRect(source) {
  const size = sourceSize(source.node); const crop = source.crop || {};
  const left = pct(crop.left), top = pct(crop.top), right = pct(crop.right), bottom = pct(crop.bottom);
  const sx = size.w * left, sy = size.h * top, sw = Math.max(1, size.w * (1 - left - right)), sh = Math.max(1, size.h * (1 - top - bottom));
  return { sx, sy, sw, sh };
}
function drawAudioPlate(ctx, source) {
  const grad = ctx.createLinearGradient(0, 0, source.w, source.h);
  grad.addColorStop(0, '#101827'); grad.addColorStop(1, '#102a3f'); ctx.fillStyle = grad; ctx.fillRect(0, 0, source.w, source.h);
  ctx.fillStyle = '#83ffe7'; ctx.font = 'bold 22px sans-serif'; ctx.fillText(source.name || 'Audio Source', 18, 38);
  ctx.fillStyle = '#9fb4ff'; ctx.font = '14px monospace'; ctx.fillText('audio available · add Livestream Visualizer', 18, 64);
  ctx.strokeStyle = '#83ffe777';
  for (let i = 0; i < 18; i++) { const x = 18 + i * 18; const h = 18 + ((i * 13) % 42); ctx.beginPath(); ctx.moveTo(x, source.h - 20); ctx.lineTo(x, source.h - 20 - h); ctx.stroke(); }
}
function drawBrowserPlate(ctx, source) { ctx.fillStyle = '#070b16'; ctx.fillRect(0, 0, source.w, source.h); ctx.fillStyle = '#dbe7ff'; ctx.font = '24px sans-serif'; ctx.fillText(source.type === 'browser' ? 'Browser Source' : 'Iframe source', 22, 52); ctx.font = '16px monospace'; ctx.fillText((source.url || '').slice(0, 46), 22, 88); ctx.strokeStyle = '#35518f'; ctx.lineWidth = 8; ctx.strokeRect(8, 8, source.w - 16, source.h - 16); }
function drawMissing(ctx, source) { ctx.fillStyle = '#221018'; ctx.fillRect(0, 0, source.w, source.h); ctx.fillStyle = '#ffdbe6'; ctx.font = '18px sans-serif'; ctx.fillText('Source unavailable', 18, 42); }
function sourceSize(node) { return { w:node.videoWidth || node.naturalWidth || node.width || 1, h:node.videoHeight || node.naturalHeight || node.height || 1 }; }
function pct(value) { return Math.max(0, Math.min(.9, Number(value || 0) / 100)); }
