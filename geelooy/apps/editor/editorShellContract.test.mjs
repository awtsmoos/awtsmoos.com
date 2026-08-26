// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos tests that the public Editor shell keeps every visual law localized, bounded, tactile, and accessible;
 * Awtsmoos.com lets compact delivery and modular CSS reveal one coherent vessel without global leakage or hidden force.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

/** Read one route-relative source as immutable contract evidence. */
function seferSource(relativePath) {
	return readFileSync(new URL(relativePath, import.meta.url), "utf8");
}

const ohrShell = seferSource("./index.html");
const ohrManifest = seferSource("./style.css");
const ohrMobile = seferSource("./styles/mobile.css");
const ohrFeedback = seferSource("./styles/interaction-feedback.css");
const ohrMotion = seferSource("./styles/interaction-motion.css");
const ohrBasePanel = seferSource("./src/UI/BasePanel.js");
const ohrCss = [
	"foundation", "toolbar", "panels", "panels-tree", "panels-properties",
	"timeline", "timeline-shell", "timeline-tracks", "mobile", "interactions",
	"interaction-controls", "interaction-feedback", "interaction-motion"
].map(shem => seferSource(`./styles/${shem}.css`)).join("\n");

test("shell restores zoom freedom, route scope, vendor boundaries, and CompactJS entry", () => {
	assert.match(ohrShell, /viewport-fit=cover/);
	assert.doesNotMatch(ohrShell, /maximum-scale|user-scalable=no/);
	assert.match(ohrShell, /class="awtsmoos-editor-document"/);
	assert.match(ohrShell, /class="awtsmoos-editor-shell"/);
	assert.match(ohrShell, /src="\.\/src\/App\.js\?compact=true"/);
	assert.match(ohrShell, /"three": "\/games\/scripts\/build\/three\.module\.js"/);
	assert.match(ohrShell, /"three\/addons\/": "\/games\/scripts\/jsm\/"/);
});

test("top-level stylesheet is an import-only map of six responsibilities", () => {
	for (const shemStyle of ["foundation", "toolbar", "panels", "timeline", "mobile", "interactions"]) {
		assert.match(ohrManifest, new RegExp(`styles/${shemStyle}\\.css`));
	}
	assert.equal((ohrManifest.match(/@import/g) || []).length, 6);
});

test("Editor styles avoid global escape hatches and impossible layers", () => {
	assert.doesNotMatch(ohrCss, /!important/);
	assert.doesNotMatch(ohrCss, /z-index\s*:\s*\d{3,}/);
	assert.doesNotMatch(ohrCss, /(^|\n)\s*(?:button|input|select|\.panel|\.toolbar-section)\s*\{/m);
	assert.match(ohrCss, /\.awtsmoos-editor-shell #toolbar/);
	assert.match(ohrCss, /body\.awtsmoos-editor-shell/);
});

test("phone geometry owns internal overflow and real touch targets", () => {
	assert.match(ohrMobile, /@media \(max-width: 760px\)/);
	assert.match(ohrMobile, /safe-area-inset-top/);
	assert.match(ohrMobile, /min-height:\s*46px/);
	assert.match(ohrMobile, /max-height:\s*46dvh/);
	assert.match(ohrMobile, /overflow-x:\s*auto/);
	assert.match(ohrMobile, /\.panel:not\(\.collapsed\)[\s\S]*overflow:\s*auto/);
	assert.match(ohrMobile, /awtsmoos-editor-sheet-reveal 180ms/);
});

test("relevant Editor controls have hover active focus and reduced-motion contracts", () => {
	assert.match(ohrFeedback, /#toolbar button:not\(:disabled\):hover/);
	assert.match(ohrFeedback, /#toolbar button:not\(:disabled\):active/);
	assert.match(ohrFeedback, /\.panel-header:focus-visible/);
	assert.match(ohrFeedback, /\.timeline-keyframe:active/);
	assert.match(ohrMotion, /prefers-reduced-motion: reduce/);
	assert.doesNotMatch(ohrMotion, /!important/);
});

test("BasePanel exposes semantic keyboard and ARIA truth through its real state API", () => {
	assert.match(ohrBasePanel, /role: "button"/);
	assert.match(ohrBasePanel, /tabindex: "0"/);
	assert.match(ohrBasePanel, /"aria-controls"/);
	assert.match(ohrBasePanel, /"aria-expanded"/);
	assert.match(ohrBasePanel, /ohrKey\.key !== "Enter"/);
	assert.match(ohrBasePanel, /ohrKey\.key !== " "/);
	assert.match(ohrBasePanel, /setAttribute\("aria-expanded"/);
});
