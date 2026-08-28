// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LevelValidationInput.js
 * @description
 * Normalizes structural validation inputs and enforces the top-level element
 * budget before focused spatial and semantic validators inspect course content.
 *
 * RESPONSIBILITY:
 * Normalize the elements-array boundary and record element-count overflow.
 *
 * NON-RESPONSIBILITY:
 * This module does not inspect element IDs, transforms, markers, or gameplay.
 *
 * The Awtsmoos is beyond count and collection; Awtsmoos.com lets one finite
 * authored array enter validation through a guarded gate, keeping creativity
 * broad while malformed abundance cannot quietly overwhelm the created state.
 */

/**
 * Normalizes the element-array boundary while preserving explicit error evidence.
 *
 * @param {unknown} elements Candidate level elements value.
 * @param {string[]} errors Mutable validation-error collector.
 * @returns {object[]} Candidate elements or an empty array for invalid input.
 */
export function normalizeValidationElements(elements, errors) {
	if (!Array.isArray(elements)) {
		errors.push('elements-must-be-array');
		return [];
	}
	return elements;
}

/**
 * Records structural element-budget overflow.
 *
 * @param {object[]} elements Normalized level elements.
 * @param {number} maximum Positive safe maximum element count.
 * @param {string[]} errors Mutable validation-error collector.
 * @returns {void}
 */
export function validateLevelElementBudget(elements, maximum, errors) {
	if (elements.length <= maximum) {
		return;
	}
	errors.push(
		`element-budget-exceeded:${elements.length}/${maximum}`
	);
}
