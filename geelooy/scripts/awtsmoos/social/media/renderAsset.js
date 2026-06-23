// B"H
/**
 * @module RenderAsset
 * @description
 * One normalized asset enters; one beautiful safe HTML vessel emerges.
 */

import { assetKind, escapeHtml, normalizeAsset, text } from './mediaManifest.js';

function renderTranscript(asset) {
  const transcript = text(asset.transcript || asset.audioNoteText || asset.captionText);
  return transcript ? `<p class="bh-social-asset-transcript">${escapeHtml(transcript)}</p>` : '';
}

function renderImage(asset) {
  const caption = text(asset.caption || asset.description);
  return `
<figure class="bh-social-asset bh-social-asset-image" data-asset-id="${escapeHtml(asset.id)}">
  <img src="${escapeHtml(asset.url)}" alt="${escapeHtml(asset.name)}" loading="lazy" />
  ${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ''}
</figure>`;
}

function renderAudio(asset) {
  const voiceClass = asset.type.includes('voice') ? ' bh-social-asset-voice' : '';
  return `
<figure class="bh-social-asset bh-social-asset-audio${voiceClass}" data-asset-id="${escapeHtml(asset.id)}">
  <figcaption>${escapeHtml(asset.name)}</figcaption>
  <audio controls preload="metadata" src="${escapeHtml(asset.url)}"></audio>
  ${renderTranscript(asset)}
</figure>`;
}

function renderVideo(asset) {
  const caption = text(asset.caption || asset.description || asset.name);
  return `
<figure class="bh-social-asset bh-social-asset-video" data-asset-id="${escapeHtml(asset.id)}">
  <video controls preload="metadata" src="${escapeHtml(asset.url)}"></video>
  <figcaption>${escapeHtml(caption)}</figcaption>
</figure>`;
}

function renderFile(asset) {
  return `
<p class="bh-social-asset bh-social-asset-file" data-asset-id="${escapeHtml(asset.id)}">
  <a href="${escapeHtml(asset.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(asset.name)}</a>
</p>`;
}

export function isImageAsset(asset = {}) { return assetKind(asset) === 'image'; }
export function isAudioAsset(asset = {}) { return assetKind(asset) === 'audio'; }
export function isVideoAsset(asset = {}) { return assetKind(asset) === 'video'; }

export function renderAsset(asset = {}) {
  const item = normalizeAsset(asset);
  if (!item.url) return '';
  const kind = assetKind(item);
  if (kind === 'image') return renderImage(item);
  if (kind === 'audio') return renderAudio(item);
  if (kind === 'video') return renderVideo(item);
  return renderFile(item);
}
