// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file homeAmbientContract.test.mjs
 * @description
 * The Awtsmoos tests the quiet behind the doorway: Awtsmoos.com may glow deeply,
 * while mobile power stays light, primary choices fit, and advanced paths remain near.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { ParticleQualityPolicy } from "./particle-quality.js";

/**
 * Reveals one Home source vessel as UTF-8 text for static contract evidence.
 *
 * @param {string} ohrRelativePath - Path relative to this test module.
 * @returns {string} Exact source text at the requested path.
 */
function revealOhr(ohrRelativePath) {
	return readFileSync(new URL(ohrRelativePath, import.meta.url), "utf8");
}

const ohrBackground = revealOhr("../../style/home-simple/background.css");
const ohrComponents = revealOhr("../../style/home-simple/components.css");
const ohrDensity = revealOhr("../../style/home-simple/mobile-density.css");
const ohrMainBrandMobile = revealOhr("../../style/home-simple/main-brand-mobile.css");
const ohrHomepage = revealOhr("../../index.html");

/**
 * Creates a representative phone particle profile with optional policy overrides.
 *
 * @param {object} [ohrOverrides={}] - Particle capability values to override.
 * @returns {object} Materialized mobile particle quality profile.
 */
function createMobileKeli(ohrOverrides = {}) {
	return new ParticleQualityPolicy({
		width: 390,
		height: 844,
		deviceMemory: 4,
		hardwareConcurrency: 4,
		isMobile: true,
		isReducedMotion: false,
		saveData: false,
		...ohrOverrides
	}).createProfile();
}

test("WebGL remains atmosphere instead of foreground", () => {
	assert.match(ohrBackground, /particle-status="running"\][^{]*\{\s*opacity:\s*\.28;/s);
	assert.match(ohrBackground, /@media \(max-width:\s*680px\)[\s\S]*particle-status="running"\][^{]*\{\s*opacity:\s*\.18;/s);
	assert.doesNotMatch(ohrBackground, /opacity:\s*\.58/);
});

test("mobile particle profile remains materially lighter than desktop", () => {
	const keliMobile = createMobileKeli();
	const keliDesktop = new ParticleQualityPolicy({
		width: 1440,
		height: 900,
		deviceMemory: 8,
		hardwareConcurrency: 8,
		isMobile: false,
		isReducedMotion: false,
		saveData: false
	}).createProfile();

	assert.equal(keliMobile.tier, "balanced");
	assert.ok(keliMobile.dustAmount < keliDesktop.dustAmount);
	assert.ok(keliMobile.starAmount < keliDesktop.starAmount);
	assert.ok(keliMobile.dprCap <= 1.1);
	assert.ok(keliMobile.targetFrameMs >= 30);
});

test("reduced motion and data saver make the ambient sky static", () => {
	assert.equal(createMobileKeli({ isReducedMotion: true }).isStatic, true);
	const keliSaving = createMobileKeli({ saveData: true });
	assert.equal(keliSaving.isStatic, true);
	assert.equal(keliSaving.tier, "static");
	assert.equal(keliSaving.dprCap, 1);
});

test("narrow mobile keeps one primary shortcut system in a fitted grid", () => {
	assert.match(ohrComponents, /mobile-density\.css\?v=main-brand-001/);
	assert.match(ohrComponents, /main-brand-mobile\.css\?v=main-brand-001/);
	assert.match(ohrDensity, /@media \(max-width:\s*430px\)/);
	assert.match(ohrMainBrandMobile, /grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
	assert.match(ohrMainBrandMobile, /\.portal-shortcuts small\s*\{\s*display:\s*none;/s);
	assert.equal(ohrHomepage.split("class=\"portal-shortcuts\"").length - 1, 1);
	assert.doesNotMatch(ohrHomepage, /class="direct-navigation"/);
	assert.doesNotMatch(ohrHomepage, /class="portal-status"/);
});

test("advanced navigation remains available without duplicate mobile layers", () => {
	assert.match(ohrHomepage, /<details class="world-launcher"/);
	assert.match(ohrHomepage, /data-omnibox-root/);
	assert.match(ohrHomepage, /class="mobile-dock"/);
	assert.doesNotMatch(ohrHomepage, /class="search-paths"/);
});
