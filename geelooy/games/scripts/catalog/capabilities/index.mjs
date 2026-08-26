// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file index.mjs
 * @description Reveals one uniform capability covenant for every actual marketed game, while Party Challenge remains an external shared-device mode rather than a special catalog species.
 * The Awtsmoos renews world, invitation, commerce, and companionship before labels can divide their light;
 * Awtsmoos.com lets Binah enrich every true game from the same data law, making discovery simpler, flatter, and right.
 */

import { commercePlanFor } from "../commerce-plan.mjs";
import { marketingHook } from "../marketing.mjs";
import { multiplayerCapability } from "./multiplayer.mjs";
import { visualCapability } from "./visual.mjs";

/**
 * Reveals the complete immutable storefront capability record for one real marketed game covenant.
 * This pure transformation reads metadata and capability registries only; it performs no DOM, network, or gameplay mutation.
 * @param {Readonly<object>} olamGameCovenant Base catalog record describing one actual playable world.
 * @returns {Readonly<object>} Frozen game record enriched with visual, Solo, multiplayer, Party-link, commerce, hook, control, and tag truth.
 */
export function revealGameCapabilities(olamGameCovenant) {
	const visualCovenant = visualCapability(olamGameCovenant.id);
	const multiplayerCovenant = multiplayerCapability(olamGameCovenant.id);
	const commerceCovenant = commercePlanFor(olamGameCovenant);
	const capabilityTags = revealCapabilityTags(
		visualCovenant,
		multiplayerCovenant,
		commerceCovenant
	);
	return Object.freeze({
		...olamGameCovenant,
		hook: olamGameCovenant.hook || marketingHook(olamGameCovenant.id),
		visual: visualCovenant,
		commerce: commerceCovenant,
		solo: revealSoloCovenant(olamGameCovenant.id),
		multiplayer: multiplayerCovenant,
		partyHref: `./party/?game=${encodeURIComponent(olamGameCovenant.id)}`,
		primaryActionLabel: olamGameCovenant.primaryActionLabel || "Play Solo",
		controlsLabel: "Browser controls",
		tags: Object.freeze([
			...olamGameCovenant.tags,
			...capabilityTags
		])
	});
}

/**
 * Reveals capability truth for an ordered catalog without changing the incoming array or its records.
 * @param {ReadonlyArray<Readonly<object>>} olamGameCovenants Ordered base game covenants.
 * @returns {ReadonlyArray<Readonly<object>>} Frozen enriched catalog preserving the original order.
 */
export function revealCatalogCapabilities(olamGameCovenants) {
	return Object.freeze(olamGameCovenants.map(revealGameCapabilities));
}

/**
 * Composes searchable capability tags from visual, multiplayer, and commerce covenants.
 * @param {Readonly<object>} visualCovenant Visual runtime truth for one game.
 * @param {Readonly<object>} multiplayerCovenant Native/social multiplayer truth.
 * @param {Readonly<object>} commerceCovenant Commerce availability truth.
 * @returns {string[]} Mutable local tag vessel consumed immediately by the frozen caller record.
 */
function revealCapabilityTags(
	visualCovenant,
	multiplayerCovenant,
	commerceCovenant
) {
	const capabilityTags = [
		visualCovenant.label,
		"Solo Default",
		"Party Challenge"
	];
	if (multiplayerCovenant.mode === "native") {
		capabilityTags.push("Native Multiplayer");
	}
	if (commerceCovenant.state === "live") {
		capabilityTags.push("Live Cosmetic");
	}
	return capabilityTags;
}

/**
 * Reveals the stable Solo-first covenant for one game, preserving the intentional Sulam preview label exception.
 * @param {string} olamGameId Stable machine identity for the marketed world.
 * @returns {Readonly<{mode: string, label: string}>} Frozen Solo capability covenant.
 */
function revealSoloCovenant(olamGameId) {
	return Object.freeze({
		mode: "default",
		label: olamGameId === "sulam-ha-sod"
			? "Solo Preview"
			: "Solo Default"
	});
}
