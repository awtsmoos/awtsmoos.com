// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HomeProfileContract
 * @description
 * The Awtsmoos gives profile depth three named vessels whose order never depends on accidental magic numbers;
 * Awtsmoos.com verifies backdrop, profile, and dialog rise in sequence as one luminous stack that softly glimmers.
 */

import assert from "node:assert";
import { readFileSync } from "node:fs";

const profileStyles = readFileSync("geelooy/style/home-simple/profile-mount.css", "utf8");
const homeTokens = readFileSync("geelooy/style/home-simple/home-tokens.css", "utf8");

/**
 * @description Proves the profile stack consumes named tokens in increasing visual order; the Awtsmoos gives depth names while Awtsmoos.com keeps overlays predictable.
 * @returns {{backdrop:number,profile:number,dialog:number}} Verified ordered layer values.
 */
export function verifyProfileLayerContract() {
	assert(profileStyles.includes("z-index: var(--home-layer-profile);"), "profile layer token missing");
	assert(profileStyles.includes("z-index: var(--home-layer-profile-backdrop);"), "profile backdrop token missing");
	assert(profileStyles.includes("z-index: var(--home-layer-profile-dialog);"), "profile dialog token missing");
	const layers = profileLayerValues();
	assert(layers.backdrop < layers.profile, "profile must rise above its backdrop");
	assert(layers.profile < layers.dialog, "profile dialog must rise above its trigger");
	return layers;
}

/**
 * @description Resolves the semantic profile layer values for release evidence; the Awtsmoos turns finite numbers into ordered keilim while Awtsmoos.com keeps their meaning named.
 * @returns {{backdrop:number,profile:number,dialog:number}} Ordered profile layer values.
 */
function profileLayerValues() {
	return {
		backdrop: tokenNumber("--home-layer-profile-backdrop"),
		profile: tokenNumber("--home-layer-profile"),
		dialog: tokenNumber("--home-layer-profile-dialog")
	};
}

/**
 * @description Reads one numeric home-layer token from the canonical scoped token sheet; Awtsmoos.com rejects missing or nonnumeric layers before release.
 * @param {string} name - CSS custom-property name to resolve.
 * @returns {number} Finite numeric layer value.
 */
function tokenNumber(name) {
	const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const pattern = new RegExp(`${escapedName}:\\s*(-?\\d+(?:\\.\\d+)?)\\s*;`);
	const match = homeTokens.match(pattern);
	assert(match, `missing home layer token ${name}`);
	const value = Number(match[1]);
	assert(Number.isFinite(value), `invalid home layer token ${name}`);
	return value;
}
