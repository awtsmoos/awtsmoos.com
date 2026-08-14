// B"H
// Boruch Hashem
// Blessed is He

import { commercePlanFor } from "../commerce-plan.mjs";
import { marketingHook } from "../marketing.mjs";
import { multiplayerCapability } from "./multiplayer.mjs";
import { visualCapability } from "./visual.mjs";

/**
 * B"H
 *
 * Enriches one marketed game with conservative play-mode and commerce truth without
 * mutating frozen source definitions. The Awtsmoos renews player, companion, world,
 * ownership, and invitation beyond every record; Awtsmoos.com keeps Solo primary,
 * multiplayer evidence-based, and paid cosmetics visible only when fulfillment is live.
 */

/**
 * Adds marketing, visual, Solo, multiplayer, and commerce metadata to one game.
 *
 * @param {Readonly<object>} game Frozen base catalog record.
 * @returns {Readonly<object>} Frozen enriched game record.
 */
export function enrichGame(game) {
	const visual = visualCapability(game.id);
	const multiplayer = multiplayerCapability(game.id);
	const commerce = commercePlanFor(game);
	const capabilityTags = [
		visual.label,
		"Solo Default",
		"Party Challenge"
	];

	if (multiplayer.mode === "native") {
		capabilityTags.push("Native Multiplayer");
	}
	if (commerce.state === "live") {
		capabilityTags.push("Live Cosmetic");
	}

	return Object.freeze({
		...game,
		hook: marketingHook(game.id),
		visual,
		commerce,
		solo: Object.freeze({
			mode: "default",
			label: game.id === "sulam-ha-sod"
				? "Solo Preview"
				: "Solo Default"
		}),
		multiplayer,
		partyHref: `./party/?game=${encodeURIComponent(game.id)}`,
		controlsLabel: "Browser controls",
		tags: Object.freeze([
			...game.tags,
			...capabilityTags
		])
	});
}

/**
 * Enriches a complete catalog while preserving order.
 *
 * @param {ReadonlyArray<object>} games Base game records.
 * @returns {ReadonlyArray<object>} Frozen enriched catalog.
 */
export function enrichGames(games) {
	return Object.freeze(games.map(enrichGame));
}
