// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos hides vast creative depth inside a calm first glance;
 * Awtsmoos.com tests that advanced worlds remain one gesture away, never a wall in the way.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { EIN_SOF_PANEL_DEFINITIONS } from "./js/EinSofPanelDefinitions.js";

/** Reveal one local source vessel as text for structural UI contracts. */
function revealOhr(relativePath) {
	return readFileSync(new URL(relativePath, import.meta.url), "utf8");
}

/** Flatten the declarative panels into one truthful control lookup. */
function collectKeilim() {
	return new Map(
		EIN_SOF_PANEL_DEFINITIONS.flatMap(panel => panel.fields).map(field => [field.id, field])
	);
}

const html = revealOhr("./index.html");
const responsiveCss = revealOhr("./css/responsive.css");
const motionCss = revealOhr("./css/motion.css");
const drawerSource = revealOhr("./js/GevurahStudioDrawer.js");
const controls = collectKeilim();

test("five studio worlds reveal only the essential Gevulot panel initially", () => {
	assert.deepEqual(
		EIN_SOF_PANEL_DEFINITIONS.map(panel => panel.title),
		["Gevulot", "Tzimtzum", "Olam Yetzirah", "Kavim v'Sefirot", "Marot Elokim"]
	);
	assert.deepEqual(
		EIN_SOF_PANEL_DEFINITIONS.map(panel => panel.open),
		[true, false, false, false, false]
	);
});

test("all seventeen legacy creative controls remain available", () => {
	assert.deepEqual(
		[...controls.keys()],
		[
			"batchInput", "headerInput", "useDirectoryPicker", "boxColor", "boxOpacity",
			"boxPadding", "boxRadius", "particleDensity", "minParticleSize", "maxParticleSize",
			"particleStyle", "particleChars", "networkType", "connectionDensity", "baseBgColor",
			"filmGrain", "bloomIntensity"
		]
	);
});

test("important defaults and random boundaries remain exact", () => {
	assert.equal(controls.get("boxColor").control.value, "#101018");
	assert.deepEqual(controls.get("boxOpacity").range, { min: "0.6", max: "0.9" });
	assert.equal(controls.get("particleDensity").control.value, "1800");
	assert.deepEqual(controls.get("particleDensity").range, { min: "1000", max: "3000" });
	assert.equal(controls.get("particleChars").control.value, "אבגדהוזחטיכלמנסעפצקרשת");
	assert.equal(controls.get("connectionDensity").control.value, "4");
	assert.equal(controls.get("baseBgColor").control.value, "#0A0814");
	assert.equal(controls.get("filmGrain").control.value, "25");
	assert.equal(controls.get("bloomIntensity").control.value, "10");
});

test("advanced select modes remain intact", () => {
	assert.deepEqual(controls.get("particleStyle").control.options, [["fragmented", "Fragmented"], ["full", "Full"]]);
	assert.deepEqual(
		controls.get("networkType").control.options,
		[["web", "Fine Web"], ["arcs", "Energy Arcs"], ["synapse", "Neural Synapse"], ["none", "None"]]
	);
});

test("preview-first shell keeps canonical output dimensions", () => {
	assert.match(html, /name="viewport"/);
	assert.match(html, /id="previewCanvas"[^>]*width="1080"[^>]*height="1920"/);
	assert.match(html, /id="controlPanels"/);
	assert.match(html, /src="\.\/js\/app\.js"/);
});

test("mobile studio retracts off canvas and narrow fields become one column", () => {
	assert.match(responsiveCss, /@media \(max-width:\s*760px\)/);
	assert.match(responsiveCss, /transform:\s*translateX\(-104%\)/);
	assert.match(responsiveCss, /\.studio-panel\.is-open\s*\{\s*transform:\s*translateX\(0\)/s);
	assert.match(responsiveCss, /@media \(max-width:\s*430px\)[\s\S]*grid-template-columns:\s*minmax\(0,\s*1fr\)/);
	assert.match(drawerSource, /if \(this\.mobileQuery\.matches\)[\s\S]*this\.closeMobile\(\)/);
});

test("futuristic motion stays brief and reduced-motion safe", () => {
	assert.doesNotMatch(motionCss, /animation\s*:[^;]*infinite/i);
	assert.match(motionCss, /prefers-reduced-motion:\s*reduce/);
	assert.match(motionCss, /animation-iteration-count:\s*1\s*!important/);
});
