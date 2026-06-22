// B"H
/**
 * @module AssetUploader
 * @description
 * Chapter 472: Browser files are lifted into the alias vault. The uploader uses
 * the already-verified `/api/social/assets/:alias/upload` river, keeping posts,
 * questions, answers, comments, verses, and subsections on one media covenant.
 */

function readAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error || new Error('Could not read file'));
    reader.onload = () => resolve(String(reader.result || '').split(',').pop() || '');
    reader.readAsDataURL(file);
  });
}

function uploadUrl(aliasId) {
  return `/api/social/assets/${encodeURIComponent(aliasId)}/upload`;
}

export async function uploadAssetFile({ aliasId, file, attachKind = 'post', postId = '', verseId = '', subsectionId = '', commentId = '' }) {
  if (!aliasId) throw new Error('aliasId required before upload');
  if (!file) throw new Error('file required before upload');
  const body = new URLSearchParams({
    fileBase64: await readAsBase64(file),
    filename: file.name || 'upload.bin',
    mime: file.type || 'application/octet-stream',
    attachKind,
    postId,
    verseId,
    subsectionId,
    commentId
  });
  const response = await fetch(uploadUrl(aliasId), {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: body.toString()
  });
  const text = await response.text();
  const json = text ? JSON.parse(text) : {};
  if (!response.ok || json.error) throw new Error(json.error?.message || text || 'Upload failed');
  return json.success?.[0] || json.success;
}

export async function pickAndUploadAssets(options = {}) {
  const input = document.createElement('input');
  input.type = 'file';
  input.multiple = options.multiple !== false;
  input.accept = options.accept || 'image/*,audio/*,video/*';
  input.style.position = 'fixed';
  input.style.left = '-10000px';
  document.body.appendChild(input);
  const files = await new Promise(resolve => {
    input.addEventListener('change', () => resolve([...input.files]), { once: true });
    input.click();
  });
  input.remove();
  const uploaded = [];
  for (const file of files) uploaded.push(await uploadAssetFile({ ...options, file }));
  return uploaded;
}
