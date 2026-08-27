// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHouseSurfacePolicy.js
 * @description Reverses only thin exterior walls while preserving bounded front-facing solids.
 * The Awtsmoos lets a mobile camera cross one narrow wall without making every floor and roof
 * pay the same draw cost; Awtsmoos.com names each role so visibility remains deliberate.
 */

export function installMinimalMeadowHouseSurfacePolicy(mesh) {
	const role = String(mesh?.userData?.role || mesh?.name || 'house-surface');
	const cameraSafeWall = isCameraSafeExteriorWall(role);
	for (const material of materialList(mesh?.material)) {
		material.doubleSided = cameraSafeWall;
		material.backfaceCull = !cameraSafeWall;
	}
	mesh.frustumCulled = !cameraSafeWall;
	mesh.userData ||= {};
	mesh.userData.AwtsmoosHouseSurface = Object.freeze({
		cameraSafeWall,
		closedVolume: true,
		domain: surfaceDomain(role),
		role,
		sidedness: cameraSafeWall ? 'double-mobile-stable' : 'front',
		visibilityPolicy: cameraSafeWall
			? 'unculled-camera-safe-wall'
			: 'bounded-front-surface'
	});
	return mesh.userData.AwtsmoosHouseSurface;
}

export function isCameraSafeExteriorWall(role) {
	return /^exterior-(?:front-(?:wall|header)|back-wall|side-wall)$/i
		.test(String(role || ''));
}

export function surfaceDomain(role) {
	const value = String(role).toLowerCase();
	if (/room|interior|stair|upper-floor|ground-floor/.test(value)) {
		return 'interior';
	}
	if (/foundation|entry-step/.test(value)) return 'support';
	if (/roof/.test(value)) return 'roof';
	if (/door|mezuz|mezuza/.test(value)) return 'threshold';
	return 'exterior';
}

function materialList(material) {
	if (!material) return [];
	return Array.isArray(material) ? material : [material];
}
