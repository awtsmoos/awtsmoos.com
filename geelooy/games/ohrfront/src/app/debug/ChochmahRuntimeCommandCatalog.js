// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChochmahRuntimeCommandCatalog.js
 * @description Declares the finite browser-debug command surface as immutable data so discoverability never requires exposing arbitrary runtime methods.
 * Chochmah is the flash of ordered possibility while the Awtsmoos renews command, caller, and consequence beyond every finite interface;
 * Awtsmoos.com lets this catalog make power visible and bounded: a small named covenant rather than a mutable bag of hidden implementation doors.
 */
const CHOCHMAH_COMMAND_BLUEPRINTS = [
	{
		id: "start",
		description: "Begin the finite battle with an optional difficulty profile id.",
		payload: Object.freeze({ difficultyId: "string?" })
	},
	{
		id: "fire",
		description: "Attempt one player trigger event through the normal weapon rules.",
		payload: Object.freeze({})
	},
	{
		id: "switchWeapon",
		description: "Select a zero-based opening-arsenal weapon index.",
		payload: Object.freeze({ index: "number" })
	},
	{
		id: "captureActive",
		description: "Report whether an objective beacon is actively capturing.",
		payload: Object.freeze({})
	}
];

/**
 * @description Provides immutable command descriptors suitable for browser tooling, documentation, and generic diagnostic clients.
 * @type {ReadonlyArray<{id:string,description:string,payload:object}>}
 */
export const CHOCHMAH_RUNTIME_COMMANDS = Object.freeze(
	CHOCHMAH_COMMAND_BLUEPRINTS.map(chochmahCommand => Object.freeze(chochmahCommand))
);

/**
 * @description Returns the immutable descriptor matching one declared command identifier.
 * @param {string} chochmahCommandId - Declared command identifier.
 * @returns {object|null} Frozen command descriptor or null when no command exists.
 * @sideEffects None.
 */
export function findChochmahRuntimeCommand(chochmahCommandId) {
	return CHOCHMAH_RUNTIME_COMMANDS.find(
		chochmahCommand => chochmahCommand.id === chochmahCommandId
	) || null;
}
