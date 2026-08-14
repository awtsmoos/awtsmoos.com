// B"H

const assert = require("node:assert/strict");
const test = require("node:test");
const { buildPreviewActions } = require("../actionGroups/previewActions.js");

/**
 * @file Proves account preview proposals never masquerade as completed creation.
 */
test("preview proposals expose authorization truth", async () => {
	const payload = {
		controlBaseUrl: "https://awtsmoos.com/api/tunnel/control/fs/native-one",
		tunnelName: "native-one",
		path: "dist/index.html",
		visibility: "private",
		title: "Dist"
	};
	const actions = buildPreviewActions({ payload });
	const file = await actions.previewFile();
	assert.equal(file.ok, true);
	assert.equal(file.preview.kind, "file");
	assert.equal(file.created, false);
	assert.equal(file.publicVerified, false);
	assert.equal(file.authorizationRequired, true);
	assert.match(file.url, /preview\/create/);
	assert.match(file.url, /preview64=/);
	const page = await buildPreviewActions({
		payload: { ...payload, content: "<h1>Report</h1>" }
	}).previewPage();
	assert.equal(page.preview.kind, "page");
	const settings = await actions.previewSettingsSet();
	assert.equal(settings.performed, false);
	assert.equal(settings.authorizationRequired, true);
});
