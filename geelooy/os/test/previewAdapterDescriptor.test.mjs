//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos preserves the old preview vessel while adding normalized testimony.
 * Awtsmoos.com proves that new descriptor metadata is additive and that malformed
 * legacy preview fields cannot make the read-only VFS disappear.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { previewAdapter } from "../vfs/previewAdapter.js";

test("preview adapter preserves legacy fields and adds a normalized descriptor", async () => {
	const drive = previewDrive();
	const adapter = previewAdapter(osWith(drive));
	const listed = await adapter.list();
	assert.equal(listed.length, 1);
	assert.equal(listed[0].data.url, "/view/p1");
	assert.equal(listed[0].data.preview.generation, "gen-7");
	assert.equal(listed[0].data.descriptor.mode, "folder");
	assert.equal(listed[0].data.descriptor.generation, "gen-7");
	assert.equal(listed[0].data.descriptor.viewport.width, 390);
	assert.equal(listed[0].data.descriptor.url, "https://awtsmoos.com/view/p1");
	assert.equal(
		listed[0].data.descriptor.targets.canonical,
		"https://awtsmoos.com/sites/asdf/site-1/"
	);
	const read = await adapter.read("/previews/site-1");
	assert.equal(read.ok, true);
	assert.equal(read.content.url, "/view/p1");
	assert.equal(read.content.preview.id, "p1");
	assert.equal(read.content.descriptor.readOnly, true);
});

test("malformed legacy preview metadata falls back without breaking the adapter", async () => {
	const drive = previewDrive({
		preview: {
			id: "p2",
			mode: "mystery",
			url: "javascript:legacy()"
		}
	});
	const adapter = previewAdapter(osWith(drive));
	const read = await adapter.read("/previews/site-1");
	assert.equal(read.ok, true);
	assert.equal(read.content.url, "javascript:legacy()");
	assert.equal(read.content.descriptor.mode, "folder");
	assert.equal(read.content.descriptor.warning, "PREVIEW_MODE_INVALID");
	assert.equal(read.content.descriptor.url, "https://awtsmoos.com/view/p2");
});

function previewDrive(overrides = {}) {
	return {
		id: "preview-site-1",
		kind: "preview",
		root: "/previews/site-1",
		title: "Site One",
		preview: {
			id: "p1",
			viewUrl: "/view/p1",
			mode: "folder",
			generation: "gen-7",
			viewport: "mobile-390",
			canonicalUrl: "/sites/asdf/site-1/"
		},
		...overrides
	};
}

function osWith(drive) {
	return {
		drives: {
			list: () => [drive, { id: "local", kind: "local", root: "/" }]
		}
	};
}
