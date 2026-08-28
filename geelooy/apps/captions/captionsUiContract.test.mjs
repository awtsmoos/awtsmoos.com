// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file captionsUiContract.test.mjs
 * @description
 * The Awtsmoos hides vast creative depth inside a calm first glance;
 * Awtsmoos.com tests that concealed power leaves sight and focus, then returns by one intentional passage.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { EIN_SOF_PANEL_DEFINITIONS } from "./js/EinSofPanelDefinitions.js";

/**
 * Reveals one local source vessel as text for structural UI contracts.
 *
 * @param {string} relativePath - Path relative to this test module.
 * @returns {string} Exact UTF-8 source text.
 */
function revealOhr(relativePath) {
	return readFileSync(new URL(relativePath, import.meta.url), "utf8");
}

/**
 * Flattens declarative studio panels into a truthful control lookup.
 *
	 * @returns {Map<string, object>} Control definition map keyed by field id.
 */
function collectKeilim() {
	return new Map(EIN_SOF_PANEL_DEFINITIONS.flatMap(panel => panel.fields).map(field => [field.id, field]));
}

const html = revealOhr("./index.html");
const responsiveCss = revealOhr("./css/responsive.css");
const motionCss = revealOhr("./css/motion.css");
const drawerSource = revealOhr("./js/GevurahStudioDrawer.js");
const accessibilitySource = revealOhr("./js/GevurahStudioAccessibility.js");
const controls = collectKeilim();

test("five studio worlds reveal only essential Gevulot initially", () => {
	assert.deepEqual(EIN_SOF_PANEL_DEFINITIONS.map(panel => panel.title), ["Gevulot", "Tzimtzum", "Olam Yetzirah", "Kavim v'Sefirot", "Marot Elokim"]);
	assert.deepEqual(EIN_SOF_PANEL_DEFINITIONS.map(panel => panel.open), [true, false, false, false, false]);
});

test("all seventeen legacy creative controls remain available", () => {
	assert.deepEqual([...controls.keys()], [
		"batchInput", "headerInput", "useDirectoryPicker", "boxColor", "boxOpacity", "boxPadding", "boxRadius",
		"particleDensity", "minParticleSize", "maxParticleSize", "particleStyle", "particleChars", "networkType",
		"connectionDensity", "baseBgColor", "filmGrain", "bloomIntensity"
	]);
});

test("important defaults remain exact", () => {
	assert.equal(controls.get("boxColor").control.value, "#101018");
	assert.deepEqual(controls.get("boxOpacity").range, { min: "0.6", max: "0.9" });
	assert.equal(controls.get("particleDensity").control.value, "1800");
	assert.equal(controls.get("particleChars").control.value, "אבגדהוזחטיכלמנסעפצקרשת");
	assert.equal(controls.get("baseBgColor").control.value, "#0A0814");
});

test("advanced select modes remain intact", () => {
	assert.deepEqual(controls.get("particleStyle").control.options, [["fragmented", "Fragmented"], ["full", "Full"]]);
	assert.equal(controls.get("networkType").control.options.length, 4);
});

test("preview-first shell keeps canonical output dimensions", () => {
	assert.match(html, /id="previewCanvas"[^>]*width="1080"[^>]*height="1920"/);
	assert.match(html, /id="controlPanels"/);
	assert.match(html, /src="\.\/js\/app\.js/);
});

test("closed mobile studio leaves pixels pointer input and focus tree", () => {
	assert.match(responsiveCss, /visibility:\s*hidden/);
	assert.match(responsiveCss, /pointer-events:\s*none/);
	assert.match(responsiveCss, /\.studio-panel\.is-open[\s\S]*visibility:\s*visible/);
	assert.match(accessibilitySource, /studioPanel\.inert\s*=\s*!isOpen/);
	assert.match(accessibilitySource, /setAttribute\("aria-hidden",\s*String\(!isOpen\)\)/);
	assert.match(drawerSource, /event\.key\s*===\s*"Escape"/);
});

test("futuristic motion stays brief and reduced-motion safe", () => {
	assert.doesNotMatch(motionCss, /animation\s*:[^;]*infinite/i);
	assert.match(motionCss, /prefers-reduced-motion:\s*reduce/);
	assert.match(motionCss, /animation-iteration-count:\s*1\s*!important/);
});
