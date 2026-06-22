/**
 * B"H
 * @file renderAsset.js
 * @description One small vessel for one media spark: image, audio, voice, video, or file.
 * The Awtsmoos breathes through every manifest without demanding one rigid schema.
 */

const EMPTY = '';

function text(value) {
  return value == null ? EMPTY : String(value);
}

function escapeHtml(value) {
  return text(value).replace(/[&<>"]/g, match => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
  })[match]);
}

function pickUrl(asset) {
  return text(asset?.url || asset?.src || asset?.path || asset?.href);
}

function pickName(asset, url) {
  return text(asset?.name || asset?.title || asset?.fileName || url.split('/').pop() || 'Media attachment');
}

function pickKind(asset, url) {
  const raw = text(asset?.kind || asset?.type || asset?.mime || asset?.contentType).toLowerCase();
  if (raw.includes('image') || /\.(png|jpe?g|gif|webp|svg|avif)$/i.test(url)) return 'image';
  if (raw.includes('audio') || raw.includes('voice') || /\.(mp3|wav|ogg|m4a|aac|webm)$/i.test(url)) return 'audio';
  if (raw.includes('video') || /\.(mp4|mov|m4v|webm)$/i.test(url)) return 'video';
  return 'file';
}

function renderTranscript(asset) {
  const transcript = text(asset?.transcript || asset?.audioNoteText || asset?.caption);
  return transcript ? `<p class="bh-social-asset-transcript">${escapeHtml(transcript)}</p>` : EMPTY;
}

function renderImage(url, name, asset) {
  const caption = text(asset?.caption || asset?.description);
  return `
<figure class="bh-social-asset bh-social-asset-image">
  <img src="${escapeHtml(url)}" alt="${escapeHtml(name)}" loading="lazy" />
  ${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : EMPTY}
</figure>`;
}

function renderAudio(url, name, asset) {
  return `
<figure class="bh-social-asset bh-social-asset-audio">
  <figcaption>${escapeHtml(name)}</figcaption>
  <audio controls preload="metadata" src="${escapeHtml(url)}"></audio>
  ${renderTranscript(asset)}
</figure>`;
}

function renderVideo(url, name, asset) {
  const caption = text(asset?.caption || asset?.description || name);
  return `
<figure class="bh-social-asset bh-social-asset-video">
  <video controls preload="metadata" src="${escapeHtml(url)}"></video>
  <figcaption>${escapeHtml(caption)}</figcaption>
</figure>`;
}

function renderFile(url, name) {
  return `
<p class="bh-social-asset bh-social-asset-file">
  <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(name)}</a>
</p>`;
}

export function renderAsset(asset = {}) {
  const url = pickUrl(asset);
  if (!url) return EMPTY;
  const name = pickName(asset, url);
  const kind = pickKind(asset, url);
  if (kind === 'image') return renderImage(url, name, asset);
  if (kind === 'audio') return renderAudio(url, name, asset);
  if (kind === 'video') return renderVideo(url, name, asset);
  return renderFile(url, name);
}
