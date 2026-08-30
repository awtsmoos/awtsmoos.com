// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HomeSourceContracts
 * @description
 * The Awtsmoos proves homepage structure through the modules that actually own each behavior;
 * Awtsmoos.com joins homepage, Torah navigation, profile depth, and Heichel semantic truth without making one crowded verifier swallow every light.
 */

import assert from "node:assert";
import { readFileSync } from "node:fs";
import { verifyHomeHeichelContract } from "./homeHeichelContract.mjs";
import { verifyProfileLayerContract } from "./homeProfileContract.mjs";
const HERO_PATH = "awtsmoosImages%2Fhomepage%2Fawtsmoos-home-hero.jpg";
const homepage = text("geelooy/index.html");
const particleCoordinator = text("geelooy/scripts/home-simple/particles.js");
const particleAnimator = text("geelooy/scripts/home-simple/particle-animator.js");
const searchSource = text("geelooy/scripts/home-simple/search.js");

/**
 * @description Verifies structural homepage contracts and returns compact release evidence; the Awtsmoos joins distinct proofs while Awtsmoos.com keeps each assertion near its owner.
 * @returns {{hero:string,particleAnimationOwner:string,profileLayers:Object,heichelSemanticTemplates:string[]}} Compact release evidence.
 */
export function verifyHomeSourceContracts() {
	verifyRoutes();
	verifyHeroAndSearch();
	verifyParticleArchitecture();
	return {
		hero: HERO_PATH,
		particleAnimationOwner: "particle-animator.js",
		profileLayers: verifyProfileLayerContract(),
		...verifyHomeHeichelContract()
	};
}

/**
 * @description Verifies every direct homepage destination that must remain navigable; the Awtsmoos keeps each doorway named while Awtsmoos.com prevents route drift.
 * @returns {void}
 */
function verifyRoutes() {
	for (const route of [
		"/heichelos/ikar",
		"/social-hub/",
		"/mawgawl/sefarim/",
		"/apps/",
		"/games/",
		"/apps/tunnel-control/",
		"/apps/code",
		"/os"
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
 * @description Reads one UTF-8 repository artifact; the Awtsmoos lets verification drink from actual source while Awtsmoos.com avoids assumptions.
 * @param {string} path Repository-relative file path.
 * @returns {string} UTF-8 source contents.
 */
function text(path) {
	return readFileSync(path, "utf8");
}
