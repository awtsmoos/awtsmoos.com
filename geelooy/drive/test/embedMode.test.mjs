//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Embed-context tests for Geelooy Drive.
 * @description
 * The Awtsmoos may place Drive inside many frames while Awtsmoos.com recognizes OS authority only through explicit same-origin covenant.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
	applyDriveDocumentMode,
	readDriveEmbedContext
} from "../core/embedMode.js";

function locationWith(search) {
	return {
		search,
		origin: "https://awtsmoos.com"
	};
}

test("ordinary Drive pages remain standalone", () => {
	assert.deepEqual(readDriveEmbedContext(locationWith("?path=/work")), {
		embedded: false,
		mode: "standalone",
		channelId: "",
		parentOrigin: ""
	});
});

test("explicit same-origin OS embed markers enable OS mode", () => {
	const context = readDriveEmbedContext(locationWith(
		"?embed=awtsmoos-os&embedParent=geelooy-os&embedChannel=chan-1&embedParentOrigin=https%3A%2F%2Fawtsmoos.com"
	));
	assert.equal(context.embedded, true);
	assert.equal(context.mode, "os");
	assert.equal(context.channelId, "chan-1");
});

test("cross-origin parent claims cannot enable OS transport", () => {
	const context = readDriveEmbedContext(locationWith(
		"?embed=awtsmoos-os&embedParent=geelooy-os&embedChannel=chan-1&embedParentOrigin=https%3A%2F%2Fevil.example"
	));
	assert.equal(context.embedded, false);
});

test("document mode is reflected as a data attribute", () => {
	const documentLike = { documentElement: { dataset: {} } };
	applyDriveDocumentMode({ mode: "os" }, documentLike);
	assert.equal(documentLike.documentElement.dataset.driveMode, "os");
});
