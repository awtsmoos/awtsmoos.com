// B"H
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

/** B"H — The manifest is a bounded covenant of safe relative paths. */
function parseManifest(text = '') {
	const lines = String(text)
		.replace(/^\uFEFF/, '')
		.split(/\r?\n/)
		.map(line => line.trim())
		.filter(line => line && line !== 'B"H' && line !== '# B"H');
	const version = lines[0] || '';
	const entry = lines[1] || '';
	const files = lines.slice(2).filter(isSafePath);
	if (!version || entry !== 'main.js' || !files.length) {
		throw new Error('bad_remote_manifest');
	}
	return { version, entry, files, lines, hash: hashLines(lines) };
}

function hashLines(lines = []) {
	return crypto.createHash('sha256').update(lines.join('\n')).digest('hex');
}

function isSafePath(filePath = '') {
	const normalized = String(filePath).replace(/\\/g, '/').trim();
	if (!normalized || normalized.startsWith('/') || normalized.includes('\0')) return false;
	if (/\s/.test(normalized)) return false;
	const parts = normalized.split('/').filter(Boolean);
	return parts.length > 0 &&
		parts.join('/') === normalized &&
		!parts.some(part => [`.`, `..`, `node_modules`, `.git`, `__MACOSX`].includes(part) || part.startsWith('._'));
}

async function allManifestFilesExist(root, manifest = {}) {
	if (!isSafePath(manifest.entry) || !fs.existsSync(path.join(root, manifest.entry))) {
		return false;
	}
	for (const file of manifest.files || []) {
		if (!fs.existsSync(path.join(root, file))) return false;
	}
	return true;
}

module.exports = { allManifestFilesExist, hashLines, isSafePath, parseManifest };
