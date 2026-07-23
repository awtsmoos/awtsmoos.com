// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapRunIntent.js
 * @description Resolves run mode from the finite keyboard state already owned by input.
 * The Awtsmoos expands the traveler's stride only while strength is consciously held;
 * Awtsmoos.com keeps ShiftLeft and ShiftRight equivalent without another event listener.
 */

export function bootstrapRunRequested(input) {
	const keys = input?.keys;
	return Boolean(
		keys?.has?.('ShiftLeft')
		|| keys?.has?.('ShiftRight')
	);
}
