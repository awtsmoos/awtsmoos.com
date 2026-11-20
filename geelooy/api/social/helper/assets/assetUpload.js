// B"H
/**
 * @module AssetUpload
 * @description
 * Chapter 470: Alias-owned binary uploads and public serving become immediately
 * visible to the Awtsmoos OS. Multipart remains primary; base64 form fields keep
 * older tests and clients alive. Every image/audio spark lands under its alias,
 * receives a manifest, gains OS and virtual-OS paths at birth, and can be served
 * back by public path with the correct MIME.
 */

const fs = require('fs');
const path = require('path');
const { er } = require('../general.js');
const { verifyAliasOwnership } = require('../alias.js');
const { DEFAULT_POLICY, POST_MEDIA_POLICY, validateAsset, assetKind } = require('./assetPolicy.js');
const { parseMultipart } = require('./multipart.js');
const { checkRateLimit } = require('./assetRateLimit.js');
const { makeAssetId, aliasAssetFile, publicAssetPath } = require('./assetPaths.js');
const { writeAssetManifest, listAssetManifests, readAssetManifest } = require('./assetManifest.js');

function safeText(value, max = 180) { return String(value || '').replace(/[<>]/g, '').trim().slice(0, max); }
function assetIdFromSegment(value) { return safeText(String(value || '').replace(/\.[a-z0-9]+$/i, ''), 140); }
function osPaths(aliasId, assetId) { return { ownerOsPath: `/os/aliases/${aliasId}/assets/${assetId}`, virtualOsPath: `/awtsmoos-os/assets/${aliasId}/${assetId}`, vaultPath: `/socialAssets/aliases/${aliasId}/${assetId}` }; }

function attachedTo(fields = {}) {
  return {
    kind: safeText(fields.attachKind || fields.kind || 'post', 32),
    postId: safeText(fields.postId || '', 80),
    verseId: safeText(fields.verseId || fields.verseSection || '', 80),
    subsectionId: safeText(fields.subsectionId || fields.segmentId || '', 80),
    commentId: safeText(fields.commentId || '', 80)
  };
}

function base64Fallback($i) {
  const body = $i.$_POST || {};
  if (!body.fileBase64) return [];
  return [{
    fieldName: 'file',
    originalName: body.filename || 'upload.bin',
    mime: body.mime || 'application/octet-stream',
    buffer: Buffer.from(String(body.fileBase64), 'base64')
  }];
}

function fieldsFrom($i, parsed) { return { ...($i.$_POST || {}), ...(parsed.fields || {}) }; }

async function ensureOwner({ $i, userid, aliasId }) {
  $i.$_GET = $i.$_GET || {};
  $i.$_POST = $i.$_POST || {};
  $i.request = $i.request || { headers: {} };
  const owns = await verifyAliasOwnership(aliasId, $i, userid);
  return owns ? null : er({ code: 'NOT_AUTHORIZED', message: 'Only the alias owner can upload assets here.' });
}

async function saveOne({ $i, aliasId, file, fields, policy = DEFAULT_POLICY }) {
  const valid = validateAsset({ mime: file.mime, size: file.buffer.length, policy });
  if (valid.error) return er(valid);
  const assetId = makeAssetId(file.buffer, file.originalName);
  const storagePath = aliasAssetFile({ $i, aliasId, kind: valid.kind, assetId, mime: file.mime, originalName: file.originalName });
  fs.mkdirSync(path.dirname(storagePath), { recursive: true });
  fs.writeFileSync(storagePath, file.buffer);
  const manifest = await writeAssetManifest({ $i, manifest: {
    id: assetId,
    aliasId,
    ownerAlias: aliasId,
    type: valid.kind,
    mime: file.mime,
    size: file.buffer.length,
    originalName: safeText(file.originalName || 'upload.bin', 180),
    storagePath,
    publicPath: publicAssetPath({ aliasId, kind: valid.kind, assetId, mime: file.mime, originalName: file.originalName }),
    ...osPaths(aliasId, assetId),
    attachedTo: attachedTo(fields),
    bindings: [],
    createdAt: Date.now()
  } });
  return { success: manifest };
}

async function uploadAssets({ $i, userid, aliasId }) {
  const blocked = await ensureOwner({ $i, userid, aliasId });
  if (blocked) return blocked;
  const rate = checkRateLimit({ $i, aliasId, limit: DEFAULT_POLICY.maxUploadsPerMinute });
  if (rate.error) return er(rate);
  const parsed = parseMultipart($i);
  const fields = fieldsFrom($i, parsed);
  const files = [...(parsed.files || []), ...base64Fallback($i)].slice(0, DEFAULT_POLICY.maxFilesPerRequest);
  if (!files.length) return er({ code: 'NO_FILES', message: 'No upload file found.' });
  const saved = [];
  for (const file of files) {
    const result = await saveOne({ $i, aliasId, file, fields });
    if (result.error) return result;
    saved.push(result.success);
  }
  return { success: saved, rate };
}

/**
 * Post-media upload seam (Hai 2026-11-20): ONE audio and/or ONE video file for
 * a post, stored in the alias vault on this server under POST_MEDIA_POLICY.
 * Storage itself is the same store()/manifest path as every other asset —
 * swapping custody later means changing assetPaths/assetUpload only.
 * The request is rejected from its Content-Length before any parsing when it
 * cannot possibly fit, so an oversized body never lands in memory whole.
 */
async function uploadPostMedia({ $i, userid, aliasId }) {
  const blocked = await ensureOwner({ $i, userid, aliasId });
  if (blocked) return blocked;
  const rate = checkRateLimit({ $i, aliasId, limit: POST_MEDIA_POLICY.maxUploadsPerMinute });
  if (rate.error) return er(rate);
  const declared = Number($i?.request?.headers?.['content-length'] || 0);
  const ceiling = POST_MEDIA_POLICY.maxVideoBytes + 2 * 1024 * 1024;
  if (declared > ceiling) {
    return er({ code: 'ASSET_TOO_LARGE', message: `Upload exceeds ${POST_MEDIA_POLICY.maxVideoBytes} bytes`, limit: POST_MEDIA_POLICY.maxVideoBytes, size: declared });
  }
  const parsed = parseMultipart($i);
  const fields = fieldsFrom($i, parsed);
  const files = (parsed.files || []).slice(0, POST_MEDIA_POLICY.maxFilesPerRequest);
  if (!files.length) return er({ code: 'NO_FILES', message: 'No upload file found.' });
  const seen = new Set();
  const saved = [];
  for (const file of files) {
    const kind = assetKind(file.mime);
    if (kind !== 'audio' && kind !== 'video') {
      return er({ code: 'UNSUPPORTED_MIME', message: `Post media must be audio or video, got: ${file.mime}` });
    }
    if (seen.has(kind)) {
      return er({ code: 'DUPLICATE_MEDIA_KIND', message: `Only one ${kind} file may be attached to a post.` });
    }
    seen.add(kind);
    const result = await saveOne({ $i, aliasId, file, fields: { ...fields, attachKind: 'post-media' }, policy: POST_MEDIA_POLICY });
    if (result.error) return result;
    saved.push(result.success);
  }
  return { success: saved, rate };
}

async function listAssets({ $i, aliasId }) { return { success: await listAssetManifests({ $i, aliasId }) }; }

async function getAssetManifest({ $i, aliasId, assetId }) {
  const id = assetIdFromSegment(assetId);
  const manifest = readAssetManifest({ $i, aliasId, assetId: id }) || await $i.db.get(`/social/aliases/${aliasId}/assets/${id}`).catch(() => null);
  return manifest ? { success: manifest } : er({ code: 'ASSET_NOT_FOUND', message: 'Asset not found.' });
}

function requestHeader($i, name) {
  const headers = $i?.request?.headers || $i?.headers || {};
  const lowered = String(name).toLowerCase();
  for (const [key, value] of Object.entries(headers)) if (String(key).toLowerCase() === lowered) return value;
  return '';
}

/** Parses a single-range `Range: bytes=...` header against a known size. */
function parseRangeHeader(value, size) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(String(value || '').trim());
  if (!match) return null;
  let start;
  let end;
  if (match[1] === '') {
    const suffix = Number(match[2]);
    if (!Number.isFinite(suffix) || suffix <= 0) return null;
    start = Math.max(0, size - suffix);
    end = size - 1;
  } else {
    start = Number(match[1]);
    end = match[2] === '' ? size - 1 : Math.min(Number(match[2]), size - 1);
  }
  if (!Number.isFinite(start) || !Number.isFinite(end) || start > end || start >= size) return null;
  return { start, end };
}

function readSlice(filePath, start, length) {
  const fd = fs.openSync(filePath, 'r');
  try {
    const buffer = Buffer.alloc(length);
    fs.readSync(fd, buffer, 0, length, start);
    return buffer;
  } finally {
    fs.closeSync(fd);
  }
}

async function serveAsset({ $i, aliasId, assetId }) {
  const got = await getAssetManifest({ $i, aliasId, assetId });
  if (!got.success) return got;
  const manifest = got.success;
  if (!manifest.storagePath || !fs.existsSync(manifest.storagePath)) return er({ code: 'ASSET_FILE_MISSING', message: 'Asset file is missing.' });
  const mime = manifest.mime || 'application/octet-stream';
  const rangeValue = requestHeader($i, 'range');
  if (rangeValue) {
    // B"H — Range support: media playback and seeking need byte ranges; only
    // the requested slice is read, never the whole file. The envelope shape
    // ({statusCode, headers, mimeType, response}) is the dynamic server's own.
    const size = fs.statSync(manifest.storagePath).size;
    const range = parseRangeHeader(rangeValue, size);
    if (!range) {
      return { statusCode: 416, headers: { 'content-range': `bytes */${size}`, 'accept-ranges': 'bytes' }, mimeType: 'text/plain; charset=utf-8', response: 'Range Not Satisfiable' };
    }
    const length = range.end - range.start + 1;
    return {
      statusCode: 206,
      headers: {
        'content-type': mime,
        'content-range': `bytes ${range.start}-${range.end}/${size}`,
        'accept-ranges': 'bytes',
        'content-length': String(length),
        'cache-control': 'public, max-age=31536000, immutable'
      },
      mimeType: mime,
      response: readSlice(manifest.storagePath, range.start, length)
    };
  }
  $i?.setHeader?.('content-type', mime);
  $i?.setHeader?.('cache-control', 'public, max-age=31536000, immutable');
  $i?.setHeader?.('accept-ranges', 'bytes');
  return fs.readFileSync(manifest.storagePath);
}

module.exports = { uploadAssets, uploadPostMedia, listAssets, getAssetManifest, serveAsset, attachedTo, osPaths };
