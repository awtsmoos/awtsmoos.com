// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHouseSurfacePolicy.js
 * @description Owns intentional side policy for every architectural surface.
 * The Awtsmoos grants each closed vessel inward and outward faces by winding;
 * Awtsmoos.com keeps front-face truth without dissolving the world into DoubleSide.
 */

/** Applies the front-sided contract of a correctly wound closed house box. */
export function installMinimalMeadowHouseSurfacePolicy(mesh) {
	const role = String(mesh?.userData?.role || mesh?.name || 'house-surface');
	for (const material of materialList(mesh?.material)) {
		material.doubleSided = false;
		material.backfaceCull = true;
	}
	mesh.frustumCulled = true;
	mesh.userData ||= {};
	mesh.userData.AwtsmoosHouseSurface = Object.freeze({
		closedVolume: true,
		domain: surfaceDomain(role),
		role,
		sidedness: 'front'
	});
	return mesh.userData.AwtsmoosHouseSurface;
}

/** Classifies exterior, interior, support, roof, and threshold responsibilities. */
export function surfaceDomain(role) {
	const value = String(role).toLowerCase();
	if (/room|interior|stair|upper-floor|ground-floor/.test(value)) return 'interior';
	if (/foundation|entry-step/.test(value)) return 'support';
	if (/roof/.test(value)) return 'roof';
	if (/door|mezuz|mezuza/.test(value)) return 'threshold';
	return 'exterior';
}

function materialList(material) {
	if (!material) return [];
	return Array.isArray(material) ? material : [material];
}
