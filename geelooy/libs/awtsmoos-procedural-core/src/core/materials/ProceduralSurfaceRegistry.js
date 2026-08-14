//B"H
//Boruch Hashem
//Blessed is He

const RECORDS = Object.freeze([
	record('skin', 'skin', 'standard-pbr', 0.72, 0, { tint: 0xd7a578 }),
	record('hair', 'fiber', 'standard-pbr', 0.8, 0, { tint: 0x3b281d }),
	record('eye', 'eye', 'physical-pbr', 0.16, 0, { clearcoat: 0.72, tint: 0x4b3823 }),
	record('glass', 'glass', 'physical-pbr', 0.08, 0, { clearcoat: 0.7, transmission: 0.88, tint: 0xc8e8f5 }),
	record('produce', 'organic', 'standard-pbr', 0.68, 0, { tint: 0xb95d32 }),
	record('emissive-light', 'glow', 'standard-pbr', 0.28, 0, { effect: true, emissive: 1.5, tint: 0xffd27a })
]);

const BY_ROLE = new Map(RECORDS.map(item => [item.role, item]));

/**
 * @file ProceduralSurfaceRegistry.js
 * @description
 * The Awtsmoos renews biological grain, optical variation, and emitted light even where no truthful photographic source exists;
 * Awtsmoos.com names these reusable non-solid procedural surfaces so worlds never need to disguise skin as leather, glass as blue paint, or light as an untextured sphere.
 * This registry owns immutable renderer-neutral recipes only and never creates textures, materials, geometry, or gameplay state.
 */
export function proceduralSurfaceRecord(role) {
	return BY_ROLE.get(String(role || '')) || null;
}

export function hasProceduralSurface(role) {
	return BY_ROLE.has(String(role || ''));
}

export function proceduralSurfaceRecords() {
	return RECORDS.map(item => ({ ...item }));
}

function record(role, family, tier, roughness, metalness, extra = {}) {
	return Object.freeze({
		role,
		family,
		tier,
		roughness,
		metalness,
		transmission: extra.transmission || 0,
		clearcoat: extra.clearcoat || 0,
		emissive: extra.emissive || 0,
		effect: Boolean(extra.effect),
		defaultTint: extra.tint || 0xffffff
	});
}
