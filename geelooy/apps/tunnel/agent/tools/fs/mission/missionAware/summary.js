// B"H
function safeProof(result = {}) {
  const proof = { ok:result.ok !== false, action:result.action || '', path:result.path || result.p || '', jobId:result.jobId || '', url:result.url || result.previewUrl || result.share?.url || '', status:result.status || '', error:result.error || '' };
  if (result.receipt) proof.receipt = result.receipt.id || result.receipt.summary || true;
  if (result.share) proof.share = { id:result.share.id, url:result.share.url, expiresAt:result.share.expiresAt, scope:result.share.scope };
  if (result.width && result.height) proof.framebuffer = { width:result.width, height:result.height, bytes:result.bytes };
  return proof;
}
function summary(action, payload = {}, result = {}) {
  const p = payload.path || payload.p || payload.cwd || payload.url || payload.jobId || '';
  const ok = result.ok === false ? 'failed' : 'completed';
  return `${action} ${ok}${p ? ` for ${p}` : ''}`;
}
module.exports = { safeProof, summary };
