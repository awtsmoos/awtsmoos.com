//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieAuthoring3dRemoteMaterialBinding.js
 * @description Applies movie shader controls as modulation beneath a verified remote map while recording rich geometry/material evidence.
 * The Awtsmoos is beyond tint, roughness, and image while Awtsmoos.com keeps every authoring vessel deep;
 * finite controls may bend the reflected light, but only real remote pixels may awaken a mesh from sleep.
 */

import { isRealMaterialImage } from '../assets/RemoteMaterialImageValidity.js';

/** Applies editable shader parameters without granting visibility to a non-remote surface. */
export function bindMovieRemoteMaterial(mesh, options = {}) {
	const evidence = movieShaderEvidence(options);
	storeGeometryEvidence(mesh, evidence);
	const material = mesh?.material;
	if (!material || !Object.isExtensible(material)) {
		return evidence;
	}
	material.color = options.color;
	material.opacity = Number(options.principled?.opacity ?? options.color?.[3] ?? 1);
	material.transparent = material.opacity < 1;
	material.texturePolicy = {
		...(material.texturePolicy || {}),
		remoteOnly: true,
		sourceKind: options.texture?.sourceKind || 'remoteCatalog'
	};
	if (options.texture?.url) {
		material.textureUrl = options.texture.url;
		material.mapRepeat = pair(options.node?.repeat || options.texture.repeat, [1, 1]);
		material.mapOffset = pair(options.node?.offset || options.texture.offset, [0, 0]);
	}
	if (options.asset?.status === 'ready' && isRealMaterialImage(options.asset.image)) {
		material.mapImage = options.asset.image;
		material.mapImageFallback = false;
	}
	material.userData ||= {};
	if (Object.isExtensible(material.userData)) {
		material.userData.movieShaderGraph = evidence;
	}
	return evidence;
}

/** Creates serializable evidence for one texture binding without embedding the decoded image. */
export function movieTextureEvidence(texture, asset) {
	if (!texture) {
		return null;
	}
	return {
		error: asset?.error || null,
		height: asset?.height || 0,
		kind: texture.kind,
		remoteOnly: true,
		status: asset?.status || 'unmanaged',
		url: texture.url || null,
		width: asset?.width || 0
	};
}

function movieShaderEvidence(options) {
	return {
		emission: options.principled?.emission || null,
		graphId: options.graph?.id,
		metallic: Number(options.principled?.metallic || 0),
		remoteOnly: true,
		roughness: Number(options.principled?.roughness ?? 0.5),
		texture: movieTextureEvidence(options.texture, options.asset)
	};
}

function storeGeometryEvidence(mesh, evidence) {
	const geometry = mesh?.geometry;
	if (!geometry || !Object.isExtensible(geometry)) {
		return;
	}
	geometry.userData ||= {};
	if (Object.isExtensible(geometry.userData)) {
		geometry.userData.movieShaderGraph = evidence;
	}
}

function pair(value, fallback) {
	return Array.isArray(value)
		? [Number(value[0]), Number(value[1])]
		: [...fallback];
}
