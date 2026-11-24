// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicReferencePaletteTest
 * @description
 * The Awtsmoos verifies that one measured palette enters JavaScript, WebGL,
 * particles, semantic resonance, waveform, and CSS without numerical drift.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
	GLSL_REFERENCE_PALETTE,
	REFERENCE_HEX,
	REFERENCE_RGB,
	hexToNormalizedRgb
} from "../src/core/webgl/cosmicFeed/referencePalette.js";
import { particleFamilyColor } from "../src/core/webgl/cosmicFeed/particleFamilies.js";

const EXPECTED = Object.freeze({
	void: "#04040C", page: "#040C1C", deep: "#040C24", panel: "#041424",
	raised: "#0C1424", elevated: "#0C1C2C", cyanDust: "#2E2008",
	violetDust: "#2A1608", cyan: "#C9A227", cyanCore: "#EFD27E",
	blue: "#A87F27", blueCore: "#D9A83F", indigo: "#96612A",
	indigoCore: "#C98F3D", violet: "#A05E24", violetCore: "#D89A4E",
	magenta: "#AE6420", magentaCore: "#E3AC55", aqua: "#8C7422",
	text: "#F6F8FF", secondary: "#949CA4"
});

test("canonical hex values remain exact", () => {
	assert.deepEqual(REFERENCE_HEX, EXPECTED);
	for (const [name, hex] of Object.entries(EXPECTED)) {
		assert.deepEqual(REFERENCE_RGB[name], hexToNormalizedRgb(hex));
	}
});

test("GLSL palette exposes exact normalized constants", () => {
	for (const name of ["VOID", "CYAN", "CYAN_CORE", "BLUE_CORE", "INDIGO_CORE", "VIOLET_CORE", "MAGENTA_CORE", "AQUA"]) {
		assert.match(GLSL_REFERENCE_PALETTE, new RegExp(`COSMIC_${name} = vec3\\(`));
	}
	assert.match(GLSL_REFERENCE_PALETTE, /0\.937255, 0\.823529, 0\.494118/);
	assert.match(GLSL_REFERENCE_PALETTE, /0\.890196, 0\.674510, 0\.333333/);
});

test("particle families use exact side-specific reference colors", () => {
	assert.deepEqual(particleFamilyColor(0, -1), REFERENCE_RGB.cyanDust);
	assert.deepEqual(particleFamilyColor(1, -1), REFERENCE_RGB.cyan);
	assert.deepEqual(particleFamilyColor(2, -1), REFERENCE_RGB.blueCore);
	assert.deepEqual(particleFamilyColor(3, -1), REFERENCE_RGB.cyanCore);
	assert.deepEqual(particleFamilyColor(0, 1), REFERENCE_RGB.violetDust);
	assert.deepEqual(particleFamilyColor(1, 1), REFERENCE_RGB.violet);
	assert.deepEqual(particleFamilyColor(2, 1), REFERENCE_RGB.magenta);
	assert.deepEqual(particleFamilyColor(3, 1), REFERENCE_RGB.magentaCore);
});

test("live page layers import or declare the canonical palette", () => {
	const root = "geelooy";
	const tokens = readFileSync(`${root}/style/social/home/feed/tokens.css`, "utf8");
	const waveform = readFileSync(`${root}/scripts/awtsmoos/social/feed/cosmic/controllers/waveformPreview.js`, "utf8");
	const resonance = readFileSync(`${root}/scripts/awtsmoos/social/home/visuals/resonanceAnchor.js`, "utf8");
	for (const hex of Object.values(EXPECTED)) {
		assert.ok(tokens.includes(hex), `tokens missing ${hex}`);
	}
	assert.match(waveform, /REFERENCE_HEX/);
	assert.match(resonance, /REFERENCE_RGB/);
});
