// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTerrainPackageEvidence.js
 * @description Records package and texture diagnostics outside the assembly doorway.
 * The Awtsmoos joins visible field and measured proof without crowding either frame;
 * Awtsmoos.com keeps every finite witness clear, while the runtime remains aflame.
 */

/**
 * Captures rendered package authority and road alignment.
 *
 * @param {object} composites Generated texture composites.
 * @param {object} density Texture-density configuration.
 * @param {object} uvInfo World-UV diagnostics.
 * @param {object} road Diagnostic road ribbon.
 * @returns {object} Frozen package evidence.
 */
export function createMinimalMeadowPackageEvidence(
	composites,
	density,
	uvInfo,
	road
) {
	return Object.freeze({
		mosaic: composites.evidence.mosaic,
		renderedChildren: 1,
		roadSurface: Object.freeze({
			collisionAligned: true,
			diagnosticFinite: road.userData.AwtsmoosRoad.finite,
			elevatedDuplicateRendered: false,
			renderAuthority: 'terrain-zone-y',
			signedDistanceAuthority: 'MinimalMeadowBezierPath',
			surfaceOffset: 0
		}),
		sourceWorldUnits: density.sourceWorldUnits,
		uvFinite: uvInfo?.finite === true,
		wrap: 'mirror-pingpong-repeat'
	});
}

/**
 * Captures texture source and density evidence for diagnostics.
 *
 * @param {object} input Texture assembly values.
 * @returns {object} Frozen texture evidence.
 */
export function createMinimalMeadowTextureEvidence(input) {
	return Object.freeze({
		anisotropy: input.density.anisotropy,
		effectiveTexelsPerWorld: input.density.effectiveTexelsPerWorld,
		grassSourceCount: input.composites.evidence.independentSourceCount,
		layerReports: input.density.layerReports,
		mobile: input.mobile,
		profile: input.density.profile,
		repeat: input.density.repeat,
		sourceSize: input.density.source,
		sourceWorldUnits: input.density.sourceWorldUnits,
		sources: Object.keys(input.sources.records),
		tileWorld: input.density.tileWorld,
		uvInfo: input.uvInfo
	});
}
