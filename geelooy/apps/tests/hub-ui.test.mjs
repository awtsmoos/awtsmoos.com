// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

/**
 * @file hub-ui.test.mjs
 * @description
 * The Awtsmoos clothes one Apps doorway through shared law and route-specific revelation;
 * Awtsmoos.com tests the composed experience, not yesterday's cache number or duplicated declaration.
 */
const html = source("geelooy/apps/index.html");
const filterCss = source("geelooy/apps/styles/filter.css");
const cardsCss = source("geelooy/apps/styles/cards.css");
const discoveryCss = source("geelooy/apps/styles/discovery.css");
const interactionsCss = source("geelooy/apps/styles/interactions.css");
const responsiveCss = source("geelooy/apps/styles/responsive.css");
const sharedControlsCss = source("geelooy/style/geelooy-system/forms/controls.css");
const sharedStatesCss = source("geelooy/style/geelooy-system/forms/states.css");
const sharedAccessibilityCss = source("geelooy/style/geelooy-app/base/accessibility.css");
const sharedLayoutCss = source("geelooy/style/geelooy-app/pages/layout.css");
const viewSource = source("geelooy/apps/scripts/filter/AppsFilterMalchusView.js");

test("Apps hub exposes stable semantic filter and live-result hooks", () => {
	assert.match(html, /style\.css\?v=apps-portfolio-\d+/);
	assert.match(html, /data-app-filter/);
	assert.match(html, /data-app-grid[^>]*aria-busy="true"/);
	assert.match(html, /data-app-result-status[^>]*role="status"[^>]*aria-live="polite"/);
	assert.match(viewSource, /data-app-result-status/);
	assert.match(viewSource, /textContent\s*=\s*`\$\{visibleCount\} of \$\{this\.cards\.length\} apps shown`/);
});

test("touch targets and focus feedback compose from shared Geelooy law", () => {
	assert.match(sharedControlsCss, /min-height:\s*48px/);
	assert.match(sharedStatesCss, /:hover:not\(:disabled\)/);
	assert.match(sharedStatesCss, /input:focus/);
	assert.match(sharedAccessibilityCss, /:focus-visible/);
	assert.match(interactionsCss, /:where\(input, select\):active/);
	assert.match(interactionsCss, /prefers-reduced-motion:\s*reduce/);
});

test("Apps filter remains mobile-first and expands only when room exists", () => {
	assert.match(filterCss, /\.g-app-filter\s*\{[\s\S]*grid-template-columns:\s*1fr/);
	assert.match(filterCss, /@media\s*\(min-width:\s*720px\)[\s\S]*grid-template-columns:\s*minmax\(0,\s*1\.6fr\)\s*minmax\(180px,\s*\.4fr\)/);
	assert.match(responsiveCss, /@media\s*\(max-width:\s*479px\)/);
	assert.match(responsiveCss, /\.apps-result-pill\s*\{[\s\S]*max-inline-size:\s*100%/);
});

test("catalog layout composes shared grid law with Apps-specific density", () => {
	assert.match(sharedLayoutCss, /\.g-grid\s*\{[\s\S]*repeat\(auto-fit,\s*minmax\(15rem,\s*1fr\)\)/);
	assert.match(discoveryCss, /\[data-app-grid\]\s*\{[\s\S]*repeat\(auto-fit,\s*minmax\(min\(100%,\s*250px\),\s*1fr\)\)/);
	assert.match(discoveryCss, /@media\s*\(min-width:\s*1080px\)[\s\S]*repeat\(3,\s*minmax\(0,\s*1fr\)\)/);
});

test("cards expose pointer, keyboard, active, and reduced-motion feedback", () => {
	assert.match(cardsCss, /\.g-app-card:focus-visible/);
	assert.match(cardsCss, /\.g-app-card:hover/);
	assert.match(cardsCss, /\.g-app-card:active/);
	assert.match(cardsCss, /prefers-reduced-motion:\s*reduce/);
});

test("Apps route avoids infinite decorative animation", () => {
	for (const css of [filterCss, cardsCss, discoveryCss, interactionsCss, responsiveCss]) {
		assert.doesNotMatch(css, /animation[^;]*infinite/i);
	}
});

/** Read one repository-relative artifact for static composed-contract verification. */
function source(path) {
	return readFileSync(path, "utf8");
}
