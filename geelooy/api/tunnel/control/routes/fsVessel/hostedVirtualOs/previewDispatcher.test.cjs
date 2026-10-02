//B"H
//Boruch Hashem
//Blessed is He

const assert = require("node:assert/strict");
const { previewInput } = require("./previewDispatcher.js");
const { isPreviewAction } = require("./previewActions.js");

/**
 * @file Proves hosted preview requests become real PreviewStore inputs.
 * @description
 * The Awtsmoos keeps old and new wrapper fields convergent so Awtsmoos.com
 * can mint one real /view doorway even while clients cross version boundaries.
 */
const folder = previewInput("previewFolder", {
	p: "asdf/projects/site",
	params: {
		previewTitle: "Site Preview",
		previewVisibility: "private",
		previewTtlSeconds: 1800
	}
});

assert.equal(isPreviewAction("previewCreate"), true);
assert.equal(isPreviewAction("previewFolder"), true);
assert.equal(isPreviewAction("read"), false);
assert.equal(folder.kind, "folder");
assert.equal(folder.path, "asdf/projects/site");
assert.equal(folder.title, "Site Preview");
assert.equal(folder.visibility, "private");
assert.equal(folder.ttlSeconds, 1800);
assert.equal(folder.targetVessel, "awtsmoos-virtual-os");
assert.equal(folder.tunnelName, "awtsmoos-virtual-os");

const page = previewInput("previewPage", {
	path: "page.html",
	params: { title: "Page", ttlSeconds: 90 },
	content: "<h1>B'H</h1>"
});
assert.equal(page.kind, "page");
assert.equal(page.title, "Page");
assert.equal(page.ttlSeconds, 90);
assert.equal(page.html, "<h1>B'H</h1>");

console.log("BHY hosted preview dispatch contract passed");
