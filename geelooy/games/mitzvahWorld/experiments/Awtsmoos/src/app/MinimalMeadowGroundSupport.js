// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowGroundSupport.js
 * @description Resolves terrain and all exact house supports through one vertical authority.
 * The Awtsmoos sustains meadow, threshold, room, tread, and landing without confusion;
 * Awtsmoos.com always prefers a valid interior floor above terrain and records its source.
 */

export function minimalMeadowGroundHeight(
	runtime, x, z, currentY, previousY = currentY
) {
	return minimalMeadowGroundReceipt(runtime, x, z, currentY, previousY).height;
}

export function minimalMeadowGroundReceipt(
	runtime, x, z, currentY, previousY = currentY
) {
	const terrain = Number(runtime.terrain?.heightAt?.(x, z)) || 0;
	const support = runtime.houses?.supportReceiptAt?.(
		x, z, currentY, previousY
	) || legacySupport(runtime, x, z, currentY);
	const supported = Number.isFinite(support?.height) && support.height >= terrain;
	return {
		height: supported ? support.height : terrain,
		profileId: supported ? support.profileId : null,
		source: supported ? support.kind : 'terrain',
		support: supported ? support.height : null,
		terrain
	};
}

function legacySupport(runtime, x, z, currentY) {
	const height = runtime.houses?.stairHeightAt?.(x, z, currentY);
	return Number.isFinite(height)
		? { height, kind: 'discrete-stair-tread', profileId: null }
		: null;
}
