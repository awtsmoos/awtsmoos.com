//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos gives every preview a reproducible viewport and generation witness.
 * Awtsmoos.com keeps source, canonical, and domain targets distinct so a preview
 * can never silently impersonate a live publication route.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { buildPreviewDescriptor } from "../vfs/previewDescriptor.js";
import {
	PREVIEW_VIEWPORTS,
	normalizePreviewViewport
} from "../vfs/previewViewportPolicy.js";

test("preview descriptor preserves mode, generation, targets and mobile viewport identity", () => {
	const descriptor = buildPreviewDescriptor({
		id: "site-1",
		title: "Homepage",
		path: "sites/site-1",
		mode: "folder",
		generation: "gen-42",
		url: "/preview/site-1/gen-42/",
		canonicalUrl: "/sites/asdf/site-1/",
		domainUrl: "https://example.com/",
		viewport: "mobile-390"
	});
	assert.equal(descriptor.mode, "folder");
	assert.equal(descriptor.generation, "gen-42");
	assert.deepEqual(descriptor.viewport, PREVIEW_VIEWPORTS["mobile-390"]);
	assert.equal(descriptor.readOnly, true);
	assert.equal(descriptor.targets.canonical, "https://awtsmoos.com/sites/asdf/site-1/");
	assert.equal(descriptor.targets.domain, "https://example.com/");
});

test("viewport policy exposes the required four verification presets", () => {
	assert.deepEqual(
		Object.values(PREVIEW_VIEWPORTS).map(({ width, height }) => [width, height]),
		[[320, 700], [390, 844], [768, 1024], [1440, 1000]]
	);
	assert.deepEqual(
		normalizePreviewViewport({ width: 1024, height: 900 }),
		{ id: "custom", width: 1024, height: 900 }
	);
});

test("preview descriptors reject invalid modes, generations, and unsafe URLs", () => {
	assert.throws(
		() => buildPreviewDescriptor({ id: "x", mode: "mystery" }),
		error => error.code === "PREVIEW_MODE_INVALID"
	);
	assert.throws(
		() => buildPreviewDescriptor({ id: "x", generation: "../escape" }),
		error => error.code === "PREVIEW_GENERATION_INVALID"
	);
	assert.throws(
		() => buildPreviewDescriptor({ id: "x", url: "javascript:alert(1)" }),
		error => error.code === "PREVIEW_URL_INVALID"
	);
});
