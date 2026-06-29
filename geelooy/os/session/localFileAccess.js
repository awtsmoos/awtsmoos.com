// B"H
import { cleanAlias, readRememberedAlias } from '/scripts/awtsmoos/social/localAliasState.js';

export function publicFileUrl({ alias, path, fileName } = {}) {
  const clean = cleanAlias(alias || currentAlias());
  if (!clean) return '';
  const query = new URLSearchParams({ path:joinApiPath(path, fileName) });
  return `${originBase()}/api/social/aliases/${encodeURIComponent(clean)}/fileSystem/readFile?${query}`;
}

export function localBlobUrl(content, fileName = 'file') {
  const blob = content instanceof Blob ? content : new Blob([content ?? '']);
  return { url:URL.createObjectURL(blob), blob, fileName };
}

export function openLocalFile(content, fileName) {
  const preview = localBlobUrl(content, fileName);
  globalThis.open?.(preview.url, '_blank', 'noopener,noreferrer');
  setTimeout(() => URL.revokeObjectURL(preview.url), 60000);
  return preview.url;
}

export async function copyPublicOrLocalUrl({ path, fileName, content, toast, os } = {}) {
  const url = publicFileUrl({ path, fileName });
  if (url) {
    await copyText(url);
    os?.recordGraphEvent?.('file.preview', { path:joinApiPath(path, fileName), url, permanent:true });
    await toast?.('Copied public alias URL.', 'success', 'alias');
    return { mode:'public', url };
  }
  const preview = localBlobUrl(content, fileName);
  await copyText(preview.url);
  await toast?.('Copied temporary local IndexedDB preview URL. Log in to publish a permanent alias URL.', 'info', 'local');
  setTimeout(() => URL.revokeObjectURL(preview.url), 60000);
  return { mode:'local', url:preview.url };
}

export async function publishLocalFile({ path, fileName, content, toast, os, refresh } = {}) {
  const alias = cleanAlias(currentAlias());
  const remotePath = joinApiPath(path, fileName);
  const metadata = metadataFor({ path:remotePath, fileName, content });
  if (!alias) return copyNeedsLogin({ content, fileName, metadata, toast });
  os?.pendingOperations?.push?.({ type:'publish', path:remotePath, at:Date.now() });
  await toast?.('Publishing local file to alias filesystem…', 'progress', 'alias', { progress:25, details:metadata });
  try {
    const response = await uploadAliasFile({ alias, path:remotePath, content, fileName });
    const url = publicFileUrl({ alias, path:'', fileName:remotePath });
    await copyText(url);
    os?.recordGraphEvent?.('file.publish', { alias, path:remotePath, url, metadata, response });
    await toast?.('Published local file and copied permanent alias URL.', 'success', 'alias', { progress:100, details:{ url, metadata } });
    refresh ? await refresh() : await os?.showFilesAtPath?.({ path });
    return { mode:'published', alias, path:remotePath, url, metadata, response };
  } finally {
    if (os?.pendingOperations) os.pendingOperations = os.pendingOperations.filter(item => item.type !== 'publish' || item.path !== remotePath);
  }
}

export function joinApiPath(path = '/', fileName = '') {
  const pieces = `${path}/${fileName}`.split('\\').join('/').split('/').filter(Boolean);
  return pieces.join('/');
}

async function copyNeedsLogin({ content, fileName, metadata, toast }) {
  const preview = localBlobUrl(content, fileName);
  await copyText(preview.url);
  await toast?.('Publish needs reconnect: copied local preview. Sign in, then choose Publish Local File again.', 'info', 'alias', { details:metadata });
  setTimeout(() => URL.revokeObjectURL(preview.url), 60000);
  return { mode:'needs-login', url:preview.url, metadata };
}

async function uploadAliasFile({ alias, path, content, fileName }) {
  const res = await fetch(`/api/social/aliases/${encodeURIComponent(alias)}/fileSystem/makeFile`, { method:'POST', credentials:'include', body:bodyFor(path, content, fileName) });
  const data = await parseResponse(res);
  if (!res.ok || data?.error) throw new Error(data?.error?.message || data?.message || 'Publish failed');
  return data;
}

function bodyFor(path, content, fileName) {
  if (!isBinary(content)) return new URLSearchParams({ path, content:String(content ?? '') });
  const form = new FormData();
  form.append('path', path);
  form.append('binaryData', asBlob(content), fileName || path.split('/').pop() || 'file');
  return form;
}

function isBinary(value) {
  return typeof Blob !== 'undefined' && (value instanceof Blob || value instanceof ArrayBuffer || value instanceof Uint8Array || (typeof File !== 'undefined' && value instanceof File));
}

function asBlob(value) { return value instanceof Blob ? value : new Blob([value]); }
async function parseResponse(res) { const text = await res.text(); try { return text ? JSON.parse(text) : {}; } catch { return { raw:text }; } }
function currentAlias() { try { return globalThis.curAlias || readRememberedAlias(); } catch { return readRememberedAlias(); } }
function originBase() { return globalThis.location?.origin || ''; }
async function copyText(text) { await globalThis.navigator?.clipboard?.writeText?.(text); }
function metadataFor({ path, fileName, content }) { return { name:fileName, path, size:sizeOf(content), type:content?.type || typeof content, lastModified:content?.lastModified || Date.now() }; }
function sizeOf(content) { if (content?.size != null) return content.size; if (content?.byteLength != null) return content.byteLength; return new Blob([String(content ?? '')]).size; }

/**
 * B"H
 * Local file access is a permissioned vessel: previews are temporary sparks,
 * published alias files become lasting graph-visible paths.
 */
