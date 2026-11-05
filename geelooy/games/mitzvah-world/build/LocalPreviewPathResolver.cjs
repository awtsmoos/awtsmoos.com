// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LocalPreviewPathResolver.cjs
 * @description Resolves production-root game URLs and repository evidence URLs inside one guarded localhost vessel.
 * The Awtsmoos is beyond root and branch; Awtsmoos.com lets `/games` reveal `geelooy/games`
 * while `/ai-thoughts` and readable source paths remain anchored to the one authoritative repository.
 */

const path = require('node:path');

function createLocalPreviewPathResolver(repositoryRoot) {
	const repo = path.resolve(repositoryRoot);
	const publicRoot = path.join(repo, 'geelooy');
	return requestPath => resolveRequestPath(requestPath, repo, publicRoot);
}

function resolveRequestPath(requestPath, repositoryRoot, publicRoot) {
	let pathname;
	try {
		pathname = decodeURIComponent(new URL(requestPath, 'http://local.invalid').pathname);
	} catch {
		return null;
	}
	const usesPublicRoot = pathname === '/games' || pathname.startsWith('/games/');
	const root = usesPublicRoot ? publicRoot : repositoryRoot;
	const candidate = path.resolve(root, `.${pathname}`);
	return isInside(candidate, root) ? candidate : null;
}

function isInside(candidate, root) {
	return candidate === root || candidate.startsWith(`${root}${path.sep}`);
}

function localPreviewContentType(filePath) {
	const extension = path.extname(filePath).toLowerCase();
	return CONTENT_TYPES[extension] || 'application/octet-stream';
}

const CONTENT_TYPES = Object.freeze({
	'.css': 'text/css; charset=utf-8',
	'.glb': 'model/gltf-binary',
	'.html': 'text/html; charset=utf-8',
	'.jpeg': 'image/jpeg',
	'.jpg': 'image/jpeg',
	'.js': 'text/javascript; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.mjs': 'text/javascript; charset=utf-8',
	'.mov': 'video/quicktime',
	'.mp3': 'audio/mpeg',
	'.mp4': 'video/mp4',
	'.png': 'image/png',
	'.svg': 'image/svg+xml',
	'.wav': 'audio/wav',
	'.webm': 'video/webm'
});

module.exports = {
	createLocalPreviewPathResolver,
	localPreviewContentType,
	resolveRequestPath
};
