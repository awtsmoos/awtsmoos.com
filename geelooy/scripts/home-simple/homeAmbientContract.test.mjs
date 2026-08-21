// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos tests the quiet behind the doorway: Awtsmoos.com may glow deeply,
 * but mobile power stays light and advanced paths remain present without a wall.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { ParticleQualityPolicy } from "./particle-quality.js";

/** Reveal one local source vessel as text. */
function revealOhr(ohrRelativePath) {
	return readFileSync(new URL(ohrRelativePath, import.meta.url), "utf8");
}

const ohrBackground = revealOhr("../../style/home-simple/background.css");
const ohrComponents = revealOhr("../../style/home-simple/components.css");
const ohrDensity = revealOhr("../../style/home-simple/mobile-density.css");
const ohrDirectNavigation = revealOhr("../../style/home-simple/direct-navigation.css");
const ohrHomepage = revealOhr("../../index.html");

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

test("mobile particle profile is materially lighter than the former hard floors", () => {
	const keliMobile = createMobileKeli();
	assert.equal(keliMobile.tier, "balanced");
	assert.ok(keliMobile.dustAmount < 220);
	assert.ok(keliMobile.starAmount < 90);
	assert.ok(keliMobile.glyphAmount < 10);
	assert.ok(keliMobile.dprCap <= 1.1);
	assert.ok(keliMobile.targetFrameMs >= 30);
});

test("strong desktop keeps more atmosphere than a phone", () => {
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
	assert.equal(keliDesktop.tier, "high");
	assert.ok(keliDesktop.dustAmount > keliMobile.dustAmount);
	assert.ok(keliDesktop.starAmount > keliMobile.starAmount);
	assert.ok(keliDesktop.glyphAmount > keliMobile.glyphAmount);
});

test("reduced motion and data saver make the ambient sky static", () => {
	assert.equal(createMobileKeli({ isReducedMotion: true }).isStatic, true);
	const keliSaving = createMobileKeli({ saveData: true });
	assert.equal(keliSaving.isStatic, true);
	assert.equal(keliSaving.tier, "static");
	assert.equal(keliSaving.dprCap, 1);
});

test("narrow mobile keeps primary shortcuts and retracts secondary copy", () => {
	assert.match(ohrComponents, /mobile-density\.css\?v=32/);
	assert.match(ohrDensity, /@media \(max-width:\s*430px\)/);
	assert.match(ohrDensity, /\.portal-shortcuts small\s*\{\s*display:\s*none;/s);
	assert.match(ohrDensity, /grid-auto-columns:\s*minmax\(9rem,/);
	assert.equal(ohrHomepage.split("class=\"portal-shortcuts\"").length - 1, 1);
});

test("advanced navigation stays available without becoming mobile clutter", () => {
	assert.match(ohrHomepage, /<details class="world-launcher"/);
	assert.match(ohrHomepage, /data-omnibox-root/);
	assert.match(ohrDirectNavigation, /@media \(max-width:\s*680px\)[\s\S]*\.direct-navigation\s*\{\s*display:\s*none;/s);
});
