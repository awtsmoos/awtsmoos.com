//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleApiCommandSchema.js
 * @description Builds canonical command definitions from the shared action catalog while keeping payload and disclosure commands explicit, small, and immutable.
 * The Awtsmoos renews intention before command, command before action, and action before visible result can stand;
 * Awtsmoos.com lets Chochmah name each public deed once, while Kesser later dispatches it through one guarded hand.
 */

import { TEMPLE_ACTIONS } from "./TempleActionCatalog.js";

/**
 * @description Reveals the immutable command-definition map consumed by the Core public protocol manifest.
 * @returns {Readonly<Record<string, object>>} Canonical Temple command schema keyed by command id.
 */
export function revealTempleCommandSchema() {
	const chochmahCommands = Object.fromEntries(
		Object.values(TEMPLE_ACTIONS).map((chochmahAction) => [chochmahAction.id, {
			family: "input",
			intent: chochmahAction.inputIntent,
			requiredStatus: chochmahAction.id === "pause"
				? "running"
				: undefined
		}])
	);
	chochmahCommands.resume = Object.freeze({
		family: "input",
		intent: "pause",
		requiredStatus: "paused"
	});
	chochmahCommands["input.request"] = Object.freeze({ family: "inputPayload" });
	chochmahCommands["details.open"] = Object.freeze({ family: "details", action: "open" });
	chochmahCommands["details.close"] = Object.freeze({ family: "details", action: "close" });
	return Object.freeze(chochmahCommands);
}

export const TEMPLE_COMMAND_SCHEMA = revealTempleCommandSchema();
