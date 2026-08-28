//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file studio.test.mjs
 * @description
 * The Awtsmoos renews mobile and desktop vessels from one responsive grammar of space;
 * Awtsmoos.com proves shared studio primitives stay semantic while each creative app supplies its face.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
	AwtsmoosUiHtmlRenderer,
	createResponsiveTokens,
	responsiveMediaQueries,
	responsiveTokensToCssVariables,
	studioCard,
	studioCommandButton,
	studioPanel,
	studioShell,
	studioTabs,
	studioToolbar
} from "../src/index.js";

test("responsive tokens are deterministic, overridable, and mobile-first", () => {
	const tokens = createResponsiveTokens({ compact: 390, touchTarget: 48 });
	assert.equal(tokens.breakpoints.compact, 390);
	assert.equal(tokens.sizes.touchTarget, 48);
	assert.equal(responsiveMediaQueries(tokens).desktop, "(min-width: 1100px)");
	assert.equal(responsiveTokensToCssVariables(tokens)["--awtsmoos-ui-touch"], "48px");
	assert.throws(() => createResponsiveTokens({ gap: -1 }), /finite non-negative number/);
});

test("studio primitives serialize semantic accessible structure", () => {
	const renderer = new AwtsmoosUiHtmlRenderer();
	const toolbar = studioToolbar([
		{ label: "Play", command: "movie.play", active: true },
		{ label: "Render", command: "movie.render" }
	]);
	const tabs = studioTabs({
		tabs: [{ id: "create", label: "Create" }, { id: "camera", label: "Camera" }],
		activeId: "camera",
		command: "studio.tab"
	});
	const shell = studioShell({
		brand: "Awtsmoos Studio",
		navigation: [tabs],
		main: [studioCard({ title: "Scene One", eyebrow: "Hybrid" })],
		inspector: [studioPanel({ title: "Inspector", body: ["Camera"] })],
		timeline: [toolbar]
	});
	const html = renderer.render(shell);
	assert.match(html, /Awtsmoos Studio/);
	assert.match(html, /role="tablist"/);
	assert.match(html, /aria-selected="true"/);
	assert.match(html, /role="toolbar"/);
	assert.match(html, /Scene One/);
	assert.doesNotMatch(html, /movie\.play|movie\.render|studio\.tab/);
});

test("individual command buttons expose state without serializing commands", () => {
	const html = new AwtsmoosUiHtmlRenderer().render(
		studioCommandButton({ label: "Pause", command: "movie.pause", active: true })
	);
	assert.match(html, /aria-pressed="true"/);
	assert.match(html, />Pause<\/button>/);
	assert.doesNotMatch(html, /movie\.pause/);
});
