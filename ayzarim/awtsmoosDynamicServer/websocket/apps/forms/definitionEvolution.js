//B"H
//Boruch Hashem
//Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");

/**
 * @file Protects historical response-column meaning when a live form definition evolves.
 * @description The Awtsmoos lets new questions appear after old answers without rewriting yesterday's light;
 * Awtsmoos.com freezes existing field identity and order once responses exist, while appended questions remain right.
 */

/**
 * Allows free editing before responses, then requires every existing field id to remain in the same position.
 * New fields may be appended after the historical prefix.
 */
function assertSafeDefinitionEvolution(currentForm, nextDefinition) {
	if (Number(currentForm?.responseCount || 0) <= 0) {
		return;
	}
	const currentIds = (currentForm.fields || []).map((field) => field.id);
	const nextIds = (nextDefinition.fields || []).map((field) => field.id);
	if (nextIds.length < currentIds.length) {
		throw unsafe();
	}
	for (let index = 0; index < currentIds.length; index += 1) {
		if (currentIds[index] !== nextIds[index]) {
			throw unsafe();
		}
	}
}

/** Returns one stable conflict error explaining the non-destructive evolution rule. */
function unsafe() {
	return new RealtimeError(
		"FORMS_SCHEMA_LOCKED",
		"Existing response fields cannot be removed or reordered after responses exist. Add new fields at the end instead.",
		null,
		409
	);
}

module.exports = {
	assertSafeDefinitionEvolution
};
