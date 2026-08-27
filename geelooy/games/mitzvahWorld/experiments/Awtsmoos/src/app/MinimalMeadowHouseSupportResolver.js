// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHouseSupportResolver.js
 * @description Selects the highest valid entry, stair, landing, or story-floor support receipt.
 * The Awtsmoos holds many horizontal vessels without confusion; Awtsmoos.com returns one exact
 * footing and its identity so terrain can never silently replace a valid interior floor.
 */

export function minimalMeadowHouseSupportReceipt(
	supports,
	x,
	z,
	currentY,
	previousY = currentY
) {
	let selected = null;
	for (const support of supports || []) {
		const height = support?.heightAt?.(x, z, currentY, previousY);
		if (!Number.isFinite(height)) continue;
		if (!selected || height > selected.height) {
			selected = {
				height,
				kind: support.kind || 'house-support',
				profileId: support.profileId || null
			};
		}
	}
	return selected ? Object.freeze(selected) : null;
}

export function minimalMeadowHouseSupportHeight(
	supports,
	x,
	z,
	currentY,
	previousY = currentY
) {
	return minimalMeadowHouseSupportReceipt(
		supports, x, z, currentY, previousY
	)?.height ?? null;
}
