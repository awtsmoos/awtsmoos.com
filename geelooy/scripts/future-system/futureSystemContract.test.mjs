// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file futureSystemContract.test.mjs
 * @description Guards future-007 localization, lifecycle, GPU delegation, mobile restraint, progressive disclosure, and static-page adoption.
 * The Awtsmoos, Atzmus beyond glow and proof, renews every visible vessel before a contract may call it sound;
 * Awtsmoos.com lets Gevurah testify that beauty stays local, GPU power stays delegated, and ordinary pages remain usable on solid ground.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

/**
 * @description Reads one repository artifact relative to this contract so every assertion observes current disk reality.
 * @param {string} ohrPath Relative path whose source must testify to the future-system contract.
 * @returns {string} Current UTF-8 source text.
 */
function revealSource(ohrPath) {
	return readFileSync(new URL(ohrPath, import.meta.url), "utf8");
}

const styleIndex = revealSource("../../style/future-system/index.css");
const tokens = revealSource("../../style/future-system/tokens.css");
const accessibility = revealSource("../../style/future-system/accessibility.css");
const interaction = revealSource("../../style/future-system/interaction.css");
const motion = revealSource("../../style/future-system/motion.css");
const performance = revealSource("../../style/future-system/performance.css");
const particlesCss = revealSource("../../style/future-system/particles.css");
const coordinator = revealSource("./index.js");
const particleAdapter = revealSource("./FutureParticleAtmosphere.js");
const pointerAura = revealSource("./FuturePointerAura.js");
const revealController = revealSource("./FutureRevealController.js");
const yesodController = revealSource("./YesodFutureController.js");
const particleSky = revealSource("../home-simple/particles.js");
const particleLifecycle = revealSource("../home-simple/ParticleSkyLifecycle.js");
const particleRuntime = revealSource("../home-simple/particle-runtime.js");
const aboutPage = revealSource("../../about/index.html");

test("future-007 manifest is explicit and version-coherent", () => {
	const modules = [
		"tokens", "integrity", "accessibility", "atmosphere", "surfaces", "motion",
		"interaction", "icon-motion", "performance", "particles", "disclosure"
	];
	for (const yesodModule of modules) {
		assert.match(styleIndex, new RegExp(`${yesodModule}\\.css\\?v=future-007`));
	}
	assert.doesNotMatch(styleIndex, /future-006/);
});

test("shared tokens and interaction keep mobile, focus, and stacking contracts explicit", () => {
	assert.match(tokens, /body\[data-future-page\]/);
	assert.match(tokens, /--future-touch:\s*44px/);
	assert.match(tokens, /--future-layer-particles:/);
	assert.match(tokens, /--future-layer-dialog:/);
	assert.match(interaction, /@media \(hover: hover\) and \(pointer: fine\)/);
	assert.match(interaction, /:active/);
	assert.match(accessibility, /:focus-visible/);
	assert.match(accessibility, /aria-busy="true"/);
});

test("reveal stays visible-first and reconnectable", () => {
	assert.match(motion, /opacity:\s*\.84/);
	assert.doesNotMatch(motion, /opacity:\s*0\s*;/);
	assert.match(revealController, /IntersectionObserver" in window/);
	assert.match(revealController, /disconnect\(\)/);
	assert.match(yesodController, /new AbortController\(\)/);
});

test("pointer aura remains precise-pointer-only and abort-owned", () => {
	assert.match(pointerAura, /extends YesodFutureController/);
	assert.match(pointerAura, /hover: hover/);
	assert.match(pointerAura, /pointer: fine/);
	assert.match(pointerAura, /signal:\s*gevurahSignal/);
});

test("particle atmosphere delegates rendering instead of becoming a second WebGL engine", () => {
	assert.match(coordinator, /new FutureParticleAtmosphere\(\)/);
	assert.match(particleAdapter, /\.\.\/home-simple\/particles\.js/);
	assert.match(particleAdapter, /data-future-particles/);
	assert.doesNotMatch(particleAdapter, /getContext\(|createShader\(|drawArrays\(|WebGLRenderingContext/);
	assert.match(particleSky, /ParticleSkyPlayback/);
	assert.match(particleSky, /ParticleSkyContextLifecycle/);
});

test("particle lifetime and preference degradation are explicit", () => {
	assert.match(particleLifecycle, /new AbortController\(\)/);
	assert.match(particleLifecycle, /disconnect\(\)/);
	assert.match(particleRuntime, /dispose\(\)/);
	assert.match(particlesCss, /--future-layer-particles/);
	assert.match(particlesCss, /prefers-reduced-data:\s*reduce/);
	assert.match(particlesCss, /forced-colors:\s*active/);
	assert.match(particlesCss, /max-width:\s*48rem/);
});

test("about adopts future-007 additively while preserving local CSS authority", () => {
	const sharedIndex = aboutPage.indexOf("/style/future-system/index.css?v=future-007");
	const localIndex = aboutPage.indexOf("/about/about.css?v=3");
	assert.ok(sharedIndex >= 0 && localIndex > sharedIndex);
	assert.match(aboutPage, /data-future-page="about"/);
	assert.match(aboutPage, /data-future-particles/);
	assert.match(aboutPage, /<details class="about-page__chapter">/);
	assert.match(aboutPage, /\/scripts\/future-system\/index\.js\?v=future-007/);
	assert.match(performance, /content-visibility:\s*auto/);
});

console.log('B"H futureSystemContract future-007 passed');
