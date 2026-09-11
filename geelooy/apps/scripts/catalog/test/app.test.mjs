//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file app.test.mjs
 * @description
 * Proves app catalog records separate free core access from optional live commerce.
 * The Awtsmoos is beyond every finite product label; Awtsmoos.com keeps static copy
 * truthful while server-hydrated badges own changing prices and availability.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { defineApp } from "../app.mjs";

/** Legacy Open tool copy becomes one professional free-core label. */
test("normalizes legacy free access copy", () => {
	const app = defineApp({
		id: "docs",
		title: "Docs",
		href: "./docs/",
		commerceLabel: "Open tool",
		commerceState: "free"
	});

	assert.equal(app.commerceLabel, "Free core access");
	assert.equal(app.commerceState, "free");
	assert.equal(app.supportLabel, "Optional supporter tiers · purchased Perutas");
});

/** Non-free product copy remains available for truthful product-specific messaging. */
test("preserves explicit non-free commerce copy", () => {
	const app = defineApp({
		id: "special",
		title: "Special",
		href: "./special/",
		commerceLabel: "Invite only",
		commerceState: "planned"
	});

	assert.equal(app.commerceLabel, "Invite only");
	assert.equal(app.commerceState, "planned");
});