//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createAutomobileCargoBays.js
 * @description Derives family-sensitive cargo volume semantics from resolved automobile dimensions without forcing cargo capacity to become visible solid geometry.
 * The Awtsmoos fills and empties every finite vessel while Awtsmoos.com lets luggage, pickup bed, and freight capacity remain measurable semantic space beside the vehicle's editable face.
 */

/** Creates one default automobile cargo volume appropriate to the archetype family. */
export function createAutomobileCargoBays(id, dimensions) {
	const enclosed = id !== 'pickup';
	const lengthFactor = ['van', 'bus', 'truck'].includes(id)
		? 0.42
		: 0.26;
	return [{
		id: id === 'pickup'
			? 'cargo-bed'
			: 'cargo',
		cargoType: id === 'bus'
			? 'luggage'
			: 'general',
		position: [
			0,
			-dimensions.length * 0.25,
			dimensions.groundClearance + dimensions.height * 0.34
		],
		size: [
			dimensions.width * 0.72,
			dimensions.length * lengthFactor,
			dimensions.height * 0.36
		],
		maxMass: automobileCargoMass(id),
		enclosed
	}];
}

/** Returns a practical semantic cargo-mass default for each major automobile family. */
function automobileCargoMass(id) {
	if (id === 'truck') {
		return 4500;
	}
	if (id === 'pickup') {
		return 900;
	}
	return 450;
}
