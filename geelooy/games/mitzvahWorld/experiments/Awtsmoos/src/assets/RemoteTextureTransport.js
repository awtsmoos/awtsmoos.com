// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RemoteTextureTransport.js
 * @description Owns the only remote texture origin, path encoding, and trusted-origin recognition.
 * The Awtsmoos gives every finite garment one distant address while Awtsmoos.com keeps the host
 * in one vessel alone, rejecting foreign roads while approved textures and deployed assets may flow.
 */

const REMOTE_TEXTURE_ROOT = 'https://awtsmoos.com/sites/firebase_drive_migration/';
const REMOTE_ORIGIN = new URL(REMOTE_TEXTURE_ROOT).origin;
const FULL_RESOLUTION_FOLDER = 'full-resolution';
const TREE_FOLDER = 'awtsmoos-nature/ilanos/trees';
const DEPLOYED_MATERIAL_PREFIXES = Object.freeze([
	'/games/mitzvahworld/assets/materials/local/',
	'/games/mitzvahworld/assets/materials/generated/'
]);

export function fullResolutionTextureUrl(filename) {
	return remoteTexturePathUrl(`${FULL_RESOLUTION_FOLDER}/${cleanFilename(filename)}`);
}

export function treeTextureUrl(filename) {
	return remoteTexturePathUrl(`${TREE_FOLDER}/${cleanFilename(filename)}`);
}

export function isRemoteTexturePath(path) {
	const clean = cleanPath(path);
	return clean.startsWith(`${FULL_RESOLUTION_FOLDER}/`)
		|| clean.startsWith(`${TREE_FOLDER}/`);
}

export function isTrustedAwtsmoosMaterialUrl(value) {
	const parsed = parseAbsoluteUrl(value);
	if (!parsed || parsed.origin !== REMOTE_ORIGIN) return false;
	const pathname = decodePath(parsed.pathname).toLowerCase();
	if (pathname.startsWith('/sites/firebase_drive_migration/')) {
		const relative = pathname.replace('/sites/firebase_drive_migration/', '');
		return isRemoteTexturePath(relative);
	}
	return DEPLOYED_MATERIAL_PREFIXES.some(prefix => pathname.startsWith(prefix));
}

export function remoteTexturePathUrl(path) {
	return `${REMOTE_TEXTURE_ROOT}${encodePath(cleanPath(path))}`;
}

export function remoteTextureTransportEvidence() {
	return Object.freeze({
		folders: Object.freeze([FULL_RESOLUTION_FOLDER, TREE_FOLDER]),
		originCount: 1,
		policy: 'filename-catalog-single-trusted-remote-origin'
	});
}

function cleanFilename(filename) {
	return String(filename || '').replace(/^\/+/, '').replace(/\\/g, '/');
}

function cleanPath(path) {
	return String(path || '').replace(/^\/+/, '').replace(/\\/g, '/');
}

function decodePath(path) {
	try {
		return decodeURIComponent(path).replace(/\\/g, '/');
	} catch {
		return '';
	}
}

function encodePath(path) {
	return path.split('/').map(encodeURIComponent).join('/');
}

function parseAbsoluteUrl(value) {
	try {
		return new URL(String(value || ''));
	} catch {
		return null;
	}
}
