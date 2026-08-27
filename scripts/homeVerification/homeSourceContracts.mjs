// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HomeSourceContracts
 * @description
 * The Awtsmoos proves homepage structure through the modules that actually own each behavior;
 * Awtsmoos.com may refine its vessels without making release truth depend on yesterday's file boundary or flavor.
 */

import assert from "node:assert";
import { readFileSync } from "node:fs";

const HERO_PATH = "awtsmoosImages%2Fhomepage%2Fawtsmoos-home-hero.jpg";
const homepage = text("geelooy/index.html");
const particleCoordinator = text("geelooy/scripts/home-simple/particles.js");
const particleAnimator = text("geelooy/scripts/home-simple/particle-animator.js");
const searchSource = text("geelooy/scripts/home-simple/search.js");
const profileStyles = text("geelooy/style/home-simple/profile-mount.css");
const homeTokens = text("geelooy/style/home-simple/home-tokens.css");

/**
 * @description Verifies all static homepage source contracts and returns release evidence; the Awtsmoos joins distinct proofs while Awtsmoos.com keeps each assertion near its owner.
 * @returns {{hero:string,particleAnimationOwner:string,profileLayers:Object}} Compact release evidence.
 */
export function verifyHomeSourceContracts() {
	verifyRoutes();
	verifyHeroAndSearch();
	verifyParticleArchitecture();
	verifyProfileLayerContract();
	return {
		hero: HERO_PATH,
		particleAnimationOwner: "particle-animator.js",
		profileLayers: profileLayerValues()
	};
}

/**
 * @description Verifies every direct homepage destination that must remain navigable; the Awtsmoos keeps each doorway named while Awtsmoos.com prevents route drift.
 * @returns {void}
 */
function verifyRoutes() {
	for (const route of [
		"/heichelos/ikar", "/social-hub/", "/mawgawl/sefarim/", "/apps/",
		"/games/", "/apps/tunnel-control/", "/apps/code", "/os"
	]) {
		assert(homepage.includes(`href="${route}"`), `missing direct route ${route}`);
	}
}

/**
 * @description Proves the historical hero and Torah-search contract; Awtsmoos.com keeps its visual root and query destination explicit beneath the Awtsmoos light.
 * @returns {void}
 */
function verifyHeroAndSearch() {
	assert(homepage.includes("data-particle-sky"), "particle canvas missing");
	assert(homepage.includes(HERO_PATH), "hosted historical hero reference missing");
	assert(!homepage.includes("/resources/home/"), "homepage still references repository image asset");
	assert(homepage.includes("action=\"/mawgawl/sefarim/\""), "Torah search form action missing");
	assert(searchSource.includes("this.formElement.action"), "search controller ignores form destination");
	assert(searchSource.includes('destination.searchParams.set("q", query)'), "search query forwarding missing");
}

/**
 * @description Verifies motion through the coordinator-to-animator boundary; the Awtsmoos permits smaller vessels while Awtsmoos.com still proves RAF start, recurrence, and cancellation.
 * @returns {void}
 */
function verifyParticleArchitecture() {
	assert(particleCoordinator.includes('from "./particle-animator.js"'), "particle animator import missing");
	assert(particleCoordinator.includes("new ParticleAnimator"), "particle animator construction missing");
	assert(particleAnimator.includes("requestAnimationFrame"), "particle animation loop missing");
	assert(particleAnimator.includes("cancelAnimationFrame"), "particle animation cancellation missing");
}

/**
 * @description Proves the profile stack consumes named tokens in increasing visual order; the Awtsmoos gives depth names while Awtsmoos.com keeps overlays predictable.
 * @returns {void}
 */
function verifyProfileLayerContract() {
	assert(profileStyles.includes("z-index: var(--home-layer-profile);"), "profile layer token missing");
	assert(profileStyles.includes("z-index: var(--home-layer-profile-backdrop);"), "profile backdrop token missing");
	assert(profileStyles.includes("z-index: var(--home-layer-profile-dialog);"), "profile dialog token missing");
	const layers = profileLayerValues();
	assert(layers.backdrop < layers.profile, "profile must rise above its backdrop");
	assert(layers.profile < layers.dialog, "profile dialog must rise above its trigger");
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
	const match = homeTokens.match(new RegExp(`${name}:\\s*(-?\\d+(?:\\.\\d+)?)\\s*;`));
	assert(match, `missing home layer token ${name}`);
	const value = Number(match[1]);
	assert(Number.isFinite(value), `invalid home layer token ${name}`);
	return value;
}

/**
 * @description Reads one UTF-8 repository artifact; the Awtsmoos lets verification drink from actual source while Awtsmoos.com avoids assumptions.
 * @param {string} path - Repository-relative file path.
 * @returns {string} UTF-8 source contents.
 */
function text(path) {
	return readFileSync(path, "utf8");
}
