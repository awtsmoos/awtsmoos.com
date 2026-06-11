// B"H
/**
 * @module AssetUpload
 * @description
 * Chapter 138: Alias-owned binary uploads and public serving.
 *
 * Multipart is primary; base64 form fields remain as a test and older-client
 * fallback. Every binary spark lands under its alias, receives a manifest, and
 * can be served back by public path with the correct MIME for images/audio.
 */

const fs = require('fs');
const path = require('path');
const { er } = require('../general.js');
const { verifyAliasOwnership } = require('../alias.js');
const { DEFAULT_POLICY, validateAsset } = require('./assetPolicy.js');
const { parseMultipart } = require('./multipart.js');
const { checkRateLimit } = require('./assetRateLimit.js');
const { makeAssetId, aliasAssetFile, publicAssetPath } = require('./assetPaths.js');
const { writeAssetManifest, listAssetManifests, readAssetManifest } = require('./assetManifest.js');

function safeText(value, max = 180) { return String(value || '').replace(/[<>]/g, '').trim().slice(0, max); }
function assetIdFromSegment(value) { return safeText(String(value || '').replace(/\.[a-z0-9]+$/i, ''), 140); }

function attachedTo(fields = {}) {
  return { kind: safeText(fields.attachKind || fields.kind || 'post', 32), postId: safeText(fields.postId || '', 80), verseId: safeText(fields.verseId || fields.verseSection || '', 80), subsectionId: safeText(fields.subsectionId || fields.segmentId || '', 80), commentId: safeText(fields.commentId || '', 80) };
}

function base64Fallback($i) {
  const body = $i.$_POST || {};
  if (!body.fileBase64) return [];
  return [{ fieldName: 'file', originalName: body.filename || 'upload.bin', mime: body.mime || 'application/octet-stream', buffer: Buffer.from(String(body.fileBase64), 'base64') }];
}

function fieldsFrom($i, parsed) { return { ...($i.$_POST || {}), ...(parsed.fields || {}) }; }

async function ensureOwner({ $i, userid, aliasId }) {
  $i.$_GET = $i.$_GET || {};
  $i.$_POST = $i.$_POST || {};
  $i.request = $i.request || { headers: {} };
  const owns = await verifyAliasOwnership(aliasId, $i, userid);
  return owns ? null : er({ code: 'NOT_AUTHORIZED', message: 'Only the alias owner can upload assets here.' });
}

async function saveOne({ $i, aliasId, file, fields }) {
  const valid = validateAsset({ mime: file.mime, size: file.buffer.length, policy: DEFAULT_POLICY });
  if (valid.error) return er(valid);
  const assetId = makeAssetId(file.buffer, file.originalName);
  const storagePath = aliasAssetFile({ $i, aliasId, kind: valid.kind, assetId, mime: file.mime, originalName: file.originalName });
  fs.mkdirSync(path.dirname(storagePath), { recursive: true });
  fs.writeFileSync(storagePath, file.buffer);
  const manifest = await writeAssetManifest({ $i, manifest: { id: assetId, aliasId, ownerAlias: aliasId, type: valid.kind, mime: file.mime, size: file.buffer.length, originalName: safeText(file.originalName || 'upload.bin', 180), storagePath, publicPath: publicAssetPath({ aliasId, kind: valid.kind, assetId, mime: file.mime, originalName: file.originalName }), attachedTo: attachedTo(fields), createdAt: Date.now() } });
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

async function listAssets({ $i, aliasId }) { return { success: await listAssetManifests({ $i, aliasId }) }; }

async function getAssetManifest({ $i, aliasId, assetId }) {
  const id = assetIdFromSegment(assetId);
  const manifest = readAssetManifest({ $i, aliasId, assetId: id }) || await $i.db.get(`/social/aliases/${aliasId}/assets/${id}`).catch(() => null);
  return manifest ? { success: manifest } : er({ code: 'ASSET_NOT_FOUND', message: 'Asset not found.' });
}

async function serveAsset({ $i, aliasId, assetId }) {
  const got = await getAssetManifest({ $i, aliasId, assetId });
  if (!got.success) return got;
  const manifest = got.success;
  if (!manifest.storagePath || !fs.existsSync(manifest.storagePath)) return er({ code: 'ASSET_FILE_MISSING', message: 'Asset file is missing.' });
  $i?.setHeader?.('content-type', manifest.mime || 'application/octet-stream');
  $i?.setHeader?.('cache-control', 'public, max-age=31536000, immutable');
  return fs.readFileSync(manifest.storagePath);
}

module.exports = { uploadAssets, listAssets, getAssetManifest, serveAsset, attachedTo };
