//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Design DNA — traditions as design languages.
 * @description Public API. Renders any content in the visual language of a
 * Torah design tradition (Chabad, Litvish, Sephardic, Chassidic, Modern) or a
 * synthesized blend of two traditions.
 *
 * Example:
 *   import { designInStyle } from "./index.mjs";
 *   const r = designInStyle("chabad");
 *   // r.ok === true, r.values["title.fontSize"] === "64px", ...
 *
 * Every design is solved through the real constraint pipeline
 * (../constraints): parse → validate → solve. A tradition is not a theme
 * name — it is a verified set of mathematical guarantees.
 */

export { DIMENSIONS, DIMENSION_DESCRIPTIONS, NUMERIC_DIMENSIONS, CATEGORICAL_DIMENSIONS, validateDNA, dnaDistance, describeDNA } from "./dna.mjs";
export { PROFILES, PROFILE_NAMES, getProfile, listProfiles } from "./profiles.mjs";
export { blendDNA, blendStyles, mixHex, dslFromDNA } from "./blender.mjs";

import { design } from "../constraints/index.mjs";
import { getHebrewBundle } from "../hebrew-first/constraints.mjs";
import { describeDNA, dnaDistance } from "./dna.mjs";
import { getProfile, PROFILES, PROFILE_NAMES } from "./profiles.mjs";
import { blendStyles } from "./blender.mjs";

/**
 * Structural Hebrew bundles every styled design carries: RTL default plus
 * the nikkud clarity guarantees. Chosen to never collide with profile paths.
 */
const STRUCTURAL_BUNDLES = ["hf-rtl-default", "hf-nikkud-guard"];

/**
 * Strips one layer of JSON string quoting from solver-serialized string
 * values (the solver's valueToString JSON.stringifies strings). Keywords,
 * colors, dimensions, and numbers pass through untouched.
 */
function cleanValues(values) {
	const out = {};
	for (const [k, v] of Object.entries(values)) {
		if (typeof v === "string" && v.length >= 2 && v.startsWith('"') && v.endsWith('"')) {
			try {
				out[k] = JSON.parse(v);
				continue;
			} catch { /* fall through */ }
		}
		out[k] = v;
	}
	return out;
}

/**
 * Renders a design in a tradition's visual language.
 * @param {string} styleName One of PROFILE_NAMES ("chabad", "litvish", "sephardic", "chassidic", "modern").
 * @param {string} extra Optional additional constraint-DSL source (caller's own
 *   constraints; must not re-assign profile paths to different constants).
 * @returns {{ok, values, errors, profile, dna: string}} Solved design + metadata.
 */
export function designInStyle(styleName, extra = "") {
	const profile = getProfile(styleName);
	const parts = [profile.source];
	for (const b of STRUCTURAL_BUNDLES) parts.push(getHebrewBundle(b));
	if (extra.trim()) parts.push(extra.trim());
	const result = design(parts.join("\n"));
	return {
		ok: result.ok,
		values: cleanValues(result.values),
		errors: result.errors,
		profile: profile.tradition,
		dna: describeDNA(profile.dna),
	};
}

/**
 * Renders a design in a blended tradition.
 * @param {string} nameA First tradition.
 * @param {string} nameB Second tradition.
 * @param {number} weightA 0..1 — 1 = fully A.
 * @param {string} extra Optional additional DSL.
 */
export function designInBlend(nameA, nameB, weightA = 0.5, extra = "") {
	const blended = blendStyles(nameA, nameB, weightA);
	const parts = [blended.source];
	for (const b of STRUCTURAL_BUNDLES) parts.push(getHebrewBundle(b));
	if (extra.trim()) parts.push(extra.trim());
	const result = design(parts.join("\n"));
	return {
		ok: result.ok,
		values: cleanValues(result.values),
		errors: result.errors,
		profile: blended.tradition,
		dna: describeDNA(blended.dna),
	};
}

/**
 * Compares all traditions pairwise by DNA distance. Nearest neighbors share
 * the most design language.
 * @returns Array of {a, b, distance} sorted ascending.
 */
export function traditionDistances() {
	const out = [];
	for (let i = 0; i < PROFILES.length; i++) {
		for (let j = i + 1; j < PROFILES.length; j++) {
			out.push({
				a: PROFILES[i].name,
				b: PROFILES[j].name,
				distance: Math.round(dnaDistance(PROFILES[i].dna, PROFILES[j].dna) * 100) / 100,
			});
		}
	}
	out.sort((x, y) => x.distance - y.distance);
	return out;
}

/**
 * Demo: solves every tradition and prints the headline values.
 */
export function demo() {
	const lines = [];
	for (const name of PROFILE_NAMES) {
		const r = designInStyle(name);
		lines.push(
			`${name}: ok=${r.ok} title=${r.values["title.fontSize"]} ` +
			`paper=${r.values["paper.background"]}/${r.values["paper.color"]} ` +
			`accent=${r.values["accent.color"]} ornament=${r.values["ornament.level"]}`
		);
	}
	const blend = designInBlend("chabad", "modern", 0.7);
	lines.push(
		`chabad×modern(70/30): ok=${blend.ok} title=${blend.values["title.fontSize"]} ` +
		`paper=${blend.values["paper.background"]}/${blend.values["paper.color"]}`
	);
	return lines.join("\n");
}
