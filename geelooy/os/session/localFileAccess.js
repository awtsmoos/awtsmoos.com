// B"H
import { cleanAlias, readRememberedAlias } from '/scripts/awtsmoos/social/localAliasState.js';
export function publicFileUrl({ alias, path, fileName }) { const clean = cleanAlias(alias || currentAlias()); return clean ? `${location.origin}/api/social/aliases/${encodeURIComponent(clean)}/fileSystem/readFile?${new URLSearchParams({ path:joinApiPath(path, fileName) })}` : ''; }
export function localBlobUrl(content, fileName = 'file') { const blob = content instanceof Blob ? content : new Blob([content ?? '']); return { url:URL.createObjectURL(blob), blob, fileName }; }
export function openLocalFile(content, fileName) { const preview = localBlobUrl(content, fileName); window.open(preview.url, '_blank', 'noopener,noreferrer'); setTimeout(() => URL.revokeObjectURL(preview.url), 60000); return preview.url; }
export async function copyPublicOrLocalUrl({ path, fileName, content, toast, os }) {
  const url = publicFileUrl({ path, fileName });
  if (url) { await navigator.clipboard?.writeText(url); os?.recordGraphEvent?.('file.preview', { path:joinApiPath(path, fileName), url, permanent:true }); await toast?.('Copied public alias URL.', 'success', 'alias'); return { mode:'public', url }; }
  const preview = localBlobUrl(content, fileName); await navigator.clipboard?.writeText(preview.url); await toast?.('Copied temporary local IndexedDB preview URL. Log in to publish a permanent alias URL.', 'info', 'local'); setTimeout(() => URL.revokeObjectURL(preview.url), 60000); return { mode:'local', url:preview.url };
}
export async function publishLocalFile({ path, fileName, content, toast, os, refresh } = {}) {
  const alias = cleanAlias(currentAlias()); const remotePath = joinApiPath(path, fileName); const metadata = metadataFor({ path:remotePath, fileName, content });
  if (!alias) { const preview = localBlobUrl(content, fileName); await navigator.clipboard?.writeText(preview.url); await toast?.('Publish needs reconnect: copied local preview. Sign in, then choose Publish Local File again.', 'info', 'alias', { details:metadata }); setTimeout(() => URL.revokeObjectURL(preview.url), 60000); return { mode:'needs-login', url:preview.url, metadata }; }
  os?.pendingOperations?.push?.({ type:'publish', path:remotePath, at:Date.now() }); await toast?.('Publishing local file to alias filesystem…', 'progress', 'alias', { progress:25, details:metadata });
  try { const response = await uploadAliasFile({ alias, path:remotePath, content, fileName }); const url = publicFileUrl({ alias, path:'', fileName:remotePath }); await navigator.clipboard?.writeText(url); os?.recordGraphEvent?.('file.publish', { alias, path:remotePath, url, metadata, response }); await toast?.('Published local file and copied permanent alias URL.', 'success', 'alias', { progress:100, details:{ url, metadata } }); refresh ? await refresh() : await os?.showFilesAtPath?.({ path }); return { mode:'published', alias, path:remotePath, url, metadata, response }; }
  finally { if (os?.pendingOperations) os.pendingOperations = os.pendingOperations.filter(x => !(x.type === 'publish' && x.path === remotePath)); }
}
async function uploadAliasFile({ alias, path, content, fileName }) { const res = await fetch(`/api/social/aliases/${encodeURIComponent(alias)}/fileSystem/makeFile`, { method:'POST', credentials:'include', body:bodyFor(path, content, fileName) }); const data = await parseResponse(res); if (!res.ok || data?.error) throw new Error(data?.error?.message || data?.message || 'Publish failed'); return data; }
function bodyFor(path, content, fileName) { if (isBinary(content)) { const form = new FormData(); form.append('path', path); form.append('binaryData', asBlob(content), fileName || path.split('/').pop() || 'file'); return form; } return new URLSearchParams({ path, content:String(content ?? '') }); }
function isBinary(v) { return typeof Blob !== 'undefined' && (v instanceof Blob || v instanceof ArrayBuffer || v instanceof Uint8Array || (typeof File !== 'undefined' && v instanceof File)); }
function asBlob(v) { return v instanceof Blob ? v : new Blob([v]); }
async function parseResponse(res) { const text = await res.text(); try { return text ? JSON.parse(text) : {}; } catch { return { raw:text }; } }
function currentAlias() { try { return window.curAlias || readRememberedAlias(); } catch { return readRememberedAlias(); } }
export function joinApiPath(path = '/', fileName = '') { const full = [path, fileName].join('/').replace(/\/g, '/').split('/').filter(Boolean).join('/'); return full || String(fileName || '').replace(/^\/+/, ''); }
function metadataFor({ path, fileName, content }) { return { name:fileName, path, size:sizeOf(content), type:content?.type || typeof content, lastModified:content?.lastModified || Date.now() }; }
function sizeOf(content) { if (content?.size != null) return content.size; if (content?.byteLength != null) return content.byteLength; return new Blob([String(content ?? '')]).size; }
/** B"H: publish now really enters /fileSystem/makeFile and returns a lasting alias URL. */
