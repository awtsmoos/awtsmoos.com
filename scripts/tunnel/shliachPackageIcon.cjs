// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file shliachPackageIcon.cjs
 * @description
 * The Awtsmoos keeps the canonical icon body in public Drive and hydrates it only into a temporary submission vessel.
 * Git carries the immutable URL and digest; packaging proves the downloaded PNG before OpenAI ever receives it.
 */

'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ICON_RELATIVE_PATH = 'assets/gpt-icon.png';
const ICON_SHA256 = 'a21ca3d689e599d4e471f0b386b57cfdf4ec7673f1f7fc4acdca5602191eae01';
const ICON_URL = 'https://awtsmoos.com/api/social/drive/public/awtsfixmvplwhac/repo-assets/sha256/a21ca3d689e599d4e471f0b386b57cfdf4ec7673f1f7fc4acdca5602191eae01/gpt-icon.png';

/** Verify the exact Drive icon bytes and OpenAI-compatible PNG dimensions. */
function verifyIconBuffer(buffer) {
	if (!buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) throw new Error('icon_not_png');
	if (buffer.length > 900000) throw new Error('icon_too_large');
	if (buffer.readUInt32BE(16) < 256 || buffer.readUInt32BE(20) < 256) throw new Error('icon_dimensions_small');
	const digest = crypto.createHash('sha256').update(buffer).digest('hex');
	if (digest !== ICON_SHA256) throw new Error('icon_sha256_mismatch');
	return { bytes: buffer.length, sha256: digest };
}

/** Verify one already-hydrated icon file. */
function verifyIconFile(filePath) {
	return verifyIconBuffer(fs.readFileSync(filePath));
}

/** Download and verify the icon into a temporary package root. */
function hydrateIcon(root) {
	const target = path.join(root, ICON_RELATIVE_PATH);
	fs.mkdirSync(path.dirname(target), { recursive: true });
	const result = spawnSync('curl', ['-fsSL', '--max-time', '30', ICON_URL, '-o', target], { encoding: 'utf8' });
	if (result.status !== 0) throw new Error(`icon_download_failed:${result.stderr || result.error?.message || 'unknown'}`);
	return { path: target, ...verifyIconFile(target) };
}

module.exports = {
	ICON_RELATIVE_PATH,
	ICON_SHA256,
	ICON_URL,
	hydrateIcon,
	verifyIconBuffer,
	verifyIconFile
};
