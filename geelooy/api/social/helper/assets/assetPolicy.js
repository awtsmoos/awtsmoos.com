// B"H
/**
 * @module AssetPolicy
 * @description
 * Chapter 114: The Awtsmoos allows images and audio into the alias chamber, but
 * not without gates. These limits keep uploads useful, bounded, and testable.
 */

const IMAGE_MIME = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);
const AUDIO_MIME = new Set(['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/ogg', 'audio/mp4', 'audio/m4a']);

const DEFAULT_POLICY = {
  maxImageBytes: 8 * 1024 * 1024,
  maxAudioBytes: 64 * 1024 * 1024,
  maxFilesPerRequest: 4,
  maxUploadsPerMinute: 18
};

function assetKind(mime) {
  const value = String(mime || '').split(';')[0].toLowerCase();
  if (IMAGE_MIME.has(value)) return 'image';
  if (AUDIO_MIME.has(value)) return 'audio';
  return '';
}

function limitFor(kind, policy = DEFAULT_POLICY) {
  return kind === 'audio' ? policy.maxAudioBytes : policy.maxImageBytes;
}

function validateAsset({ mime, size, policy = DEFAULT_POLICY }) {
  const kind = assetKind(mime);
  if (!kind) return { error: true, code: 'UNSUPPORTED_MIME', message: `Unsupported MIME: ${mime}` };
  const limit = limitFor(kind, policy);
  if (size > limit) return { error: true, code: 'ASSET_TOO_LARGE', message: `${kind} exceeds ${limit} bytes`, limit, size };
  return { success: true, kind, limit };
}

module.exports = { IMAGE_MIME, AUDIO_MIME, DEFAULT_POLICY, assetKind, validateAsset, limitFor };
