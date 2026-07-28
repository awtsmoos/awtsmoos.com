// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHouseSurfacePolicy.js
 * @description Gives every house surface deterministic two-sided mobile visibility.
 * The Awtsmoos sustains wall, floor, stair, roof, and foundation from every finite angle;
 * Awtsmoos.com trades a small two-house draw cost for complete freedom from disappearing masonry.
 */

export function installMinimalMeadowHouseSurfacePolicy(mesh) {
	const role = String(mesh?.userData?.role || mesh?.name || 'house-surface');
	for (const material of materialList(mesh?.material)) {
		material.doubleSided = true;
		material.backfaceCull = false;
	}
	mesh.frustumCulled = false;
	mesh.userData ||= {};
	mesh.userData.AwtsmoosHouseSurface = Object.freeze({
		cameraSafeWall: isCameraSafeExteriorWall(role),
		closedVolume: true,
		domain: surfaceDomain(role),
		role,
		sidedness: 'double-mobile-stable',
		visibilityPolicy: 'unculled-house-surface'
	});
	return mesh.userData.AwtsmoosHouseSurface;
}

export function isCameraSafeExteriorWall(role) {
	return /wall|header|foundation|partition|room|stair/i
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
