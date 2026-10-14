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
	const baseHeight = supported ? support.height : terrain;
	// Obstacle courses (Stream 3): a mounted course engine may contribute a
	// platform or moving platform as the authoritative ground. It only speaks
	// inside its own region and never snaps a player up through a platform.
	const course = runtime.courseEngine?.groundReceipt?.(x, z, currentY, previousY);
	if (course && Number.isFinite(course.height) && course.height >= baseHeight - 0.001) {
		return {
			height: course.height,
			profileId: course.profileId || null,
			source: course.kind || 'course',
			support: course.height,
			terrain
		};
	}
	return {
		height: baseHeight,
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
