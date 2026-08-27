/* B"H
SourceRenderer dispatches one visible source into the canvas without ceremony.
If a source owns a render hook, honor it; if not, draw the common transform.
*/
export function renderSource(ctx, source) {
  if (!source?.visible || !ctx) return false;
  if (typeof source.render === 'function') return source.render(ctx);
  const node = source.node || source.runtime?.node;
  ctx.save(); ctx.globalAlpha = source.opacity ?? 1;
  ctx.translate((source.x || 0) + (source.w || 1) / 2, (source.y || 0) + (source.h || 1) / 2);
  ctx.rotate((source.rotation || 0) * Math.PI / 180);
  try { node ? ctx.drawImage(node, -source.w / 2, -source.h / 2, source.w, source.h) : drawPlaceholder(ctx, source); }
  catch { drawPlaceholder(ctx, source); }
  ctx.restore(); return true;
}
export function createSourceRenderer(input = {}) { return { kind:'SourceRenderer', render:ctx => renderSource(ctx, input.source), source:input.source || null }; }
function drawPlaceholder(ctx, s) { ctx.fillStyle = s.settings?.color || '#101827'; ctx.fillRect(-s.w/2, -s.h/2, s.w, s.h); ctx.fillStyle = '#83ffe7'; ctx.font = '18px system-ui'; ctx.fillText(s.name || s.type || 'Source', -s.w/2 + 12, -s.h/2 + 28); }
