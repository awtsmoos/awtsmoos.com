/**
 * B"H
 * @file renderAsset.js
 * @description One universal social media spark renderer.
 *
 * The Awtsmoos breathes through every manifest shape without demanding
 * that future social vessels imitate yesterday's exact field names.
 */

const EMPTY = '';
const HTML_ESCAPE = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};

function text(value) {
  return value == null ? EMPTY : String(value);
}

function escapeHtml(value) {
  return text(value).replace(/[&<>"']/g, match => HTML_ESCAPE[match]);
}

function pickUrl(asset = {}) {
  return text(
    asset.publicPath ||
    asset.url ||
    asset.src ||
    asset.path ||
    asset.href ||
    asset.downloadUrl
  );
}

function pickName(asset = {}, url = EMPTY) {
  return text(
    asset.originalName ||
    asset.name ||
    asset.title ||
    asset.fileName ||
    asset.filename ||
    url.split('/').pop() ||
    'Media attachment'
  );
}

function typeText(asset = {}) {
  return text(asset.kind || asset.type || asset.mime || asset.contentType || asset.mediaType).toLowerCase();
}

export function isImageAsset(asset = {}) {
  const url = pickUrl(asset);
  const raw = typeText(asset);
  return raw.includes('image') || /\.(png|jpe?g|gif|webp|svg|avif)(\?.*)?$/i.test(url);
}

export function isAudioAsset(asset = {}) {
  const url = pickUrl(asset);
  const raw = typeText(asset);
  return raw.includes('audio') || raw.includes('voice') || /\.(mp3|wav|ogg|m4a|aac|flac|webm)(\?.*)?$/i.test(url);
}

export function isVideoAsset(asset = {}) {
  const url = pickUrl(asset);
  const raw = typeText(asset);
  return raw.includes('video') || /\.(mp4|mov|m4v|webm|ogv)(\?.*)?$/i.test(url);
}

function renderTranscript(asset = {}) {
  const transcript = text(asset.transcript || asset.audioNoteText || asset.captionText);
  return transcript ? `<p class="bh-social-asset-transcript">${escapeHtml(transcript)}</p>` : EMPTY;
}

function renderImage(url, name, asset) {
  const caption = text(asset.caption || asset.description);
  return `
<figure class="bh-social-asset bh-social-asset-image" data-asset-id="${escapeHtml(asset.id)}">
  <img src="${escapeHtml(url)}" alt="${escapeHtml(name)}" loading="lazy" />
  ${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : EMPTY}
</figure>`;
}

function renderAudio(url, name, asset) {
  const voiceClass = typeText(asset).includes('voice') ? ' bh-social-asset-voice' : EMPTY;
  return `
<figure class="bh-social-asset bh-social-asset-audio${voiceClass}" data-asset-id="${escapeHtml(asset.id)}">
  <figcaption>${escapeHtml(name)}</figcaption>
  <audio controls preload="metadata" src="${escapeHtml(url)}"></audio>
  ${renderTranscript(asset)}
</figure>`;
}

function renderVideo(url, name, asset) {
  const caption = text(asset.caption || asset.description || name);
  return `
<figure class="bh-social-asset bh-social-asset-video" data-asset-id="${escapeHtml(asset.id)}">
  <video controls preload="metadata" src="${escapeHtml(url)}"></video>
  <figcaption>${escapeHtml(caption)}</figcaption>
</figure>`;
}

function renderFile(url, name, asset) {
  return `
<p class="bh-social-asset bh-social-asset-file" data-asset-id="${escapeHtml(asset.id)}">
  <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(name)}</a>
</p>`;
}

export function renderAsset(asset = {}) {
  const url = pickUrl(asset);
  if (!url) return EMPTY;
  const name = pickName(asset, url);
  if (isImageAsset(asset)) return renderImage(url, name, asset);
  if (isAudioAsset(asset)) return renderAudio(url, name, asset);
  if (isVideoAsset(asset)) return renderVideo(url, name, asset);
  return renderFile(url, name, asset);
}
