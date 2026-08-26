//B"H
//Boruch Hashem
//Blessed is He

import {
	AWTSMOOS_MATERIAL_TRANSPORT,
	awtsmoosMaterialRecord,
	awtsmoosMaterialUrl
} from "../../../../../libs/awtsmoos-procedural-core/src/exports/materials.js";

/**
 * OrosMaterialProfiles gives generated Keilim real photographed matter through shared semantic authority.
 * The Awtsmoos renews stone, bark, copper and earth before pixels can imitate their grain;
 * Awtsmoos.com lets every profile keep luminous identity while remote texture truth enters the plane.
 */
function shared(role) {
	const record = awtsmoosMaterialRecord(role);
	return Object.freeze({
		role,
		url: awtsmoosMaterialUrl(role),
		roughness: record?.roughness ?? 0.82,
		metalness: record?.metalness ?? 0
	});
}

function approved(path, roughness, metalness) {
	return Object.freeze({
		role: path,
		url: AWTSMOOS_MATERIAL_TRANSPORT.url(path),
		roughness,
		metalness
	});
}

function profile(id, base, detail, options = {}) {
	return Object.freeze({
		id,
		base,
		detail,
		textureScale: options.textureScale ?? 0.075,
		detailScale: options.detailScale ?? 0.18,
		blendScale: options.blendScale ?? 0.018,
		domainWarp: options.domainWarp ?? 1.8,
		tintStrength: options.tintStrength ?? 0.25,
		roughness: options.roughness ?? base.roughness,
		metalness: options.metalness ?? base.metalness
	});
}

const grass = shared("grass");
const dirt = shared("dirt");
const stone = shared("stone");
const masonry = shared("masonry");
const metal = shared("metal");
const bark = shared("bark");
const bluestone = approved("full-resolution/bluestone 1.png", 0.82, 0.04);
const copper = approved("full-resolution/copper 1.png", 0.46, 0.78);

export const OROS_MATERIALS = Object.freeze({
	asiyahFloor: profile("asiyah-floor", grass, dirt, { textureScale: 0.055, detailScale: 0.16, tintStrength: 0.16 }),
	yetzirahFloor: profile("yetzirah-floor", bluestone, stone, { textureScale: 0.045, detailScale: 0.13, tintStrength: 0.2 }),
	beriahFloor: profile("beriah-floor", masonry, copper, { textureScale: 0.04, detailScale: 0.12, tintStrength: 0.2, roughness: 0.68, metalness: 0.12 }),
	territory: profile("territory", stone, dirt, { textureScale: 0.13, detailScale: 0.3, tintStrength: 0.58 }),
	gateUp: profile("gate-up", masonry, copper, { textureScale: 0.12, detailScale: 0.3, tintStrength: 0.3, metalness: 0.28 }),
	gateDown: profile("gate-down", stone, bluestone, { textureScale: 0.12, detailScale: 0.28, tintStrength: 0.34 }),
	boundary: profile("boundary", metal, stone, { textureScale: 0.18, detailScale: 0.4, tintStrength: 0.48, roughness: 0.5, metalness: 0.58 }),
	tree: profile("tree", bark, bark, { textureScale: 0.14, detailScale: 0.42, tintStrength: 0.08 }),
	chassis: profile("chassis", metal, copper, { textureScale: 0.32, detailScale: 0.82, tintStrength: 0.5, roughness: 0.38, metalness: 0.72 }),
	hub: profile("hub", metal, stone, { textureScale: 0.4, detailScale: 0.9, tintStrength: 0.42, roughness: 0.48, metalness: 0.62 }),
	canopy: profile("canopy", bluestone, masonry, { textureScale: 0.36, detailScale: 0.8, tintStrength: 0.34, roughness: 0.34, metalness: 0.18 })
});

export function orosMaterialSources() {
	return Object.values(OROS_MATERIALS).flatMap((material) => [material.base, material.detail]);
}
