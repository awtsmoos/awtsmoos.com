// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieAuthoredWorldTextureHydrator.js
 * @description Binds every visible authored surface to a real exact or same-family production texture.
 * The Awtsmoos is beyond image and wire; Awtsmoos.com records the real source that finally clothed each visible material.
 */

import { hydrateSceneMaterialImages } from '../assets/PublicMaterialCache.js';
import { materialList, usableImage } from './MovieProductionTextureEvidence.js';
import { loadMovieAuthoredTextureUrls } from './MovieAuthoredTextureLoader.js';
export { MOVIE_TEXTURE_LOAD_CONCURRENCY, MOVIE_TEXTURE_RECOVERY_TIMEOUT_MS, MOVIE_TEXTURE_TIMEOUT_MS } from './MovieAuthoredTextureLoader.js';

export async function hydrateMovieAuthoredWorldTextures(root, options = {}) {
	removeUnapprovedDecoration(root);
	const surfaces = collectSurfaces(root);
	const urls = [...new Set(surfaces.map(item => item.url))];
	const records = await loadMovieAuthoredTextureUrls(urls, options);
	const failed = records.filter(record => !record.ok || !usableImage(record.image));
	if (failed.length) throw textureError('decode', failed.map(item => item.requestedUrl || item.url));
	(options.bindTextures || hydrateSceneMaterialImages)(root, { requestLimit: 0, retryFailed: true });
	bindDecodedBaseImages(surfaces, records);
	const unbound = surfaces.filter(item => !usableImage(item.material.mapImage));
	if (unbound.length) throw textureError('binding', unbound.map(item => item.path));
	return Object.freeze({
		decoded: records.length,
		recovered: records.filter(record => record.recovered).length,
		substituted: records.filter(record => record.substituted).length,
		surfaces: surfaces.length,
		urls: urls.length
	});
}

function removeUnapprovedDecoration(root) {
	root?.traverse?.(node => {
		const data = node.userData || {};
		const fake = data.family === 'reference-cottage-sun-shadows'
			|| (data.family === 'reference-cottage-ornament-batch' && data.part === 'blossoms');
		if (!fake && !data.AwtsmoosYardGrass) return;
		node.visible = false;
		data.movieProductionRemoval = data.AwtsmoosYardGrass ? 'procedural-yard-grass-replaced-by-real-nature' : 'untextured-procedural-decoration';
	});
}

function collectSurfaces(root) {
	const surfaces = [];
	visit(root, [], (node, ancestors) => {
		if ((!node.isMesh && !node.isSkinnedMesh) || approved(node, ancestors)) return;
		for (const material of materialList(node.material)) {
			if (material.texturePolicy?.fallbackApplied === true) throw textureError('fallback', [`${node.name}:${material.name || 'material'}`]);
			const url = String(material.textureUrl || '').trim();
			const sign = material.texturePolicy?.bilingualSvg === true;
			if (!url || url.startsWith('procedural:') || (url.startsWith('data:') && !sign)) throw textureError('source', [`${node.name}:${material.name || 'material'}`]);
			surfaces.push({ material, path: `${node.name}:${material.name || 'material'}`, url });
		}
	});
	return surfaces;
}

function bindDecodedBaseImages(surfaces, records) {
	const byRequested = new Map(records.map(record => [record.requestedUrl, record]));
	for (const surface of surfaces) {
		const record = byRequested.get(surface.url);
		if (!usableImage(surface.material.mapImage)) surface.material.mapImage = record?.image;
		if (record?.substituted) recordSubstitution(surface.material, record);
		surface.material.needsUpdate = true;
	}
}

function recordSubstitution(material, record) {
	material.textureUrl = record.resolvedUrl;
	material.userData ||= {};
	material.userData.AwtsmoosMovieTextureRecovery = {
		family: record.family,
		requestedUrl: record.requestedUrl,
		resolvedUrl: record.resolvedUrl
	};
}

function approved(node, ancestors) {
	const chain = [...ancestors, node];
	return chain.some(item => item.userData?.AwtsmoosSky || item.userData?.AwtsmoosCanonicalPlayer || item.userData?.AwtsmoosCinemaChossid)
		|| ancestors.some(item => Boolean(item.userData?.isolatedModelLoad?.resolvedUrl && item.userData?.isolatedModelLoad?.fallback !== true));
}

function visit(node, ancestors, callback) {
	if (!node || node.visible === false) return;
	callback(node, ancestors);
	for (const child of node.children || []) visit(child, [...ancestors, node], callback);
}

function textureError(stage, paths) {
	return new Error(`Authored Movie texture ${stage} failed: ${paths.join(', ')}`);
}
