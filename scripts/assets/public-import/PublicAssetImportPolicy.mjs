// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicAssetImportPolicy.mjs
 * @description Defines additive destinations and stable canonical names for future public asset drops.
 * Awtsmoos.com keeps source bytes outside Git while one bounded policy names images, models, environments, and GPU textures without erasing provenance.
 */

import path from 'node:path';

const DESTINATIONS = Object.freeze({
	'.avif': ['full-resolution', 'image'],
	'.exr': ['environments', 'environment'],
	'.gif': ['full-resolution', 'image'],
	'.glb': ['models', 'model'],
	'.gltf': ['models', 'model'],
	'.hdr': ['environments', 'environment'],
	'.jpeg': ['full-resolution', 'image'],
	'.jpg': ['full-resolution', 'image'],
	'.ktx': ['gpu-textures', 'gpu-texture'],
	'.ktx2': ['gpu-textures', 'gpu-texture'],
	'.png': ['full-resolution', 'image'],
	'.webp': ['full-resolution', 'image']
});

/** Returns import policy for one file extension or null when unsupported. */
export function publicAssetImportPolicy(fileName) {
	const extension = path.extname(fileName).toLowerCase();
	const destination = DESTINATIONS[extension];
	if (!destination) return null;
	return Object.freeze({ extension, kind: destination[1], root: destination[0] });
}

/** Creates a stable readable canonical target while retaining full semantics in metadata. */
export function preferredPublicAssetTarget(fileName) {
	const policy = publicAssetImportPolicy(fileName);
	if (!policy) return null;
	const baseName = path.basename(fileName, path.extname(fileName)).replace(/\.\d+$/, '');
	const slug = slugName(baseName).slice(0, 120) || 'asset';
	return `${policy.root}/${slug}${policy.extension}`;
}

/** Returns human-readable source description before canonical filename shortening. */
export function publicAssetSourceDescription(fileName) {
	return path.basename(fileName, path.extname(fileName)).replace(/\.\d+$/, '').trim();
}

/** Adds content identity when two different files want the same canonical path. */
export function collisionSafePublicAssetTarget(target, sha256) {
	const extension = path.extname(target);
	const stem = target.slice(0, -extension.length);
	return `${stem}--${sha256.slice(0, 8)}${extension}`;
}

function slugName(value) {
	return String(value || '')
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}
