/* B"H
A tiny honest export: canvas frames become a local MP4 byte vessel for ffprobe.
*/
const MEDIABUNNY_URL = 'https://esm.sh/mediabunny@1.46.0?bundle';
export async function exportTimelinePreviewMp4({ width = 640, height = 360, fps = 30, seconds = 2 } = {}) {
  const mb = await import(MEDIABUNNY_URL); requireExportParts(mb);
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha:false }); let captured = null;
  const output = new mb.Output({ format:new mb.Mp4OutputFormat(), target:new mb.BufferTarget({ onFinalize:buffer => { captured = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer); } }) });
  const source = new mb.CanvasSource(canvas, { codec:'avc', bitrate:1_200_000, keyFrameInterval:1 });
  output.addVideoTrack(source, { frameRate:fps }); await output.start();
  const frames = Math.max(1, Math.round(fps * seconds));
  for (let i = 0; i < frames; i += 1) { drawFrame(ctx, width, height, i, frames); await source.add(i / fps, 1 / fps, { keyFrame:i % fps === 0 }); }
  source.close(); await output.finalize(); if (!captured?.length) throw new Error('mp4_export_empty');
  return { bytes:captured, mime:'video/mp4', width, height, fps, seconds, frames };
}
export function bytesToBase64(bytes) {
  let binary = ''; const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  return btoa(binary);
}
function drawFrame(ctx, width, height, index, total) {
  const t = index / Math.max(1, total - 1); ctx.fillStyle = '#081122'; ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#7c5cff'; ctx.fillRect(0, height * .62, width, height * .38);
  ctx.fillStyle = '#83ffe7'; ctx.fillRect(24 + t * (width - 96), 40, 72, 72);
  ctx.fillStyle = 'white'; ctx.font = '28px system-ui'; ctx.fillText('Nesher WebCodecs Export', 32, height - 54);
  ctx.font = '18px system-ui'; ctx.fillText(`frame ${index + 1}/${total}`, 32, height - 24);
}
function requireExportParts(mb) { for (const name of ['Output','Mp4OutputFormat','BufferTarget','CanvasSource']) if (!mb[name]) throw new Error(`mediabunny_missing_${name}`); }
