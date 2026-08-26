// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos tests that public discovery remains truthful across route-local and shared visual vessels;
 * Awtsmoos.com keeps loading state, touch, focus, responsive grids, and finite motion coherent as one clean catalog.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = relative => readFileSync(new URL(relative, import.meta.url), "utf8");
const html = read("../index.html");
const manifest = read("../style.css");
const filterCss = read("../styles/filter.css");
const interactionCss = read("../styles/interactions.css");
const cardCss = read("../styles/cards.css");
const discoveryCss = read("../styles/discovery.css");
const responsiveCss = read("../styles/responsive.css");
const sharedLayoutCss = read("../../style/geelooy-app/pages/layout.css");
const filterRuntime = read("../scripts/apps-filter.js");
const renderer = read("../scripts/catalog/render.mjs");

test("hub is mobile-first and loads the interaction contract", () => {
	assert.match(html, /name="viewport"[^>]*viewport-fit=cover/);
	assert.match(html, /\.\/style\.css\?v=apps-portfolio-007/);
	assert.match(manifest, /styles\/interactions\.css/);
});

test("one visible catalog status owns legacy and live runtime hooks", () => {
	assert.match(
		html,
		/<strong data-app-count data-app-result-status role="status" aria-live="polite">Loading inventory…<\/strong>/
	);
	assert.equal((html.match(/data-app-result-status/g) || []).length, 1);
	assert.match(filterRuntime, /querySelector\("\[data-app-result-status\]"\)/);
	assert.match(filterRuntime, /resultStatus\.textContent = `\$\{visibleCount\} of \$\{cards\.length\} apps shown`/);
});

test("rendered inventory clears its loading state", () => {
	assert.match(html, /data-app-grid[^>]*aria-busy="true"/);
	assert.match(renderer, /setAttribute\("aria-busy", "false"\)/);
	assert.match(renderer, /dataset\.appCount = String\(apps\.length\)/);
});

test("filter controls are touch-sized with full tactile states", () => {
	assert.match(filterCss, /min-height:\s*48px/);
	for (const state of ["hover", "active"]) {
		assert.match(interactionCss, new RegExp(`\\.g-app-filter input:${state}`));
		assert.match(interactionCss, new RegExp(`\\.g-app-filter select:${state}`));
	}
	assert.match(interactionCss, /:focus-visible/);
	assert.match(interactionCss, /prefers-reduced-motion:\s*reduce/);
});

test("catalog cards combine route-local hover active and focus feedback", () => {
	assert.match(cardCss, /\.g-app-card:hover/);
	assert.match(cardCss, /\.g-app-card:active/);
	assert.match(discoveryCss, /\.g-app-card:focus-visible/);
	assert.match(discoveryCss, /prefers-reduced-motion:\s*reduce/);
});

test("composed layout stays responsive without duplicate grid overrides", () => {
	assert.match(sharedLayoutCss, /\.g-grid\s*\{/);
	assert.match(sharedLayoutCss, /repeat\(auto-fit, minmax\(15rem, 1fr\)\)/);
	assert.match(responsiveCss, /@media \(max-width:\s*760px\)/);
	assert.match(responsiveCss, /\.g-app-filter[\s\S]*grid-template-columns:\s*1fr/);
});

test("local catalog motion never loops forever", () => {
	const localCss = [filterCss, interactionCss, cardCss, discoveryCss, responsiveCss].join("\n");
	assert.doesNotMatch(localCss, /animation:\s*[^;]*infinite/);
});
