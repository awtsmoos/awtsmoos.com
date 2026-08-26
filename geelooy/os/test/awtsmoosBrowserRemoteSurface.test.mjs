//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Awtsmoos Browser Remote Surface Tests
 * @description
 * The Awtsmoos places journeys above and session secrets below; Awtsmoos.com proves
 * that navigation remains first-class browser chrome while alias and jar controls rest
 * inside Advanced, preserving the coordinator contract without reviving a flat tool row.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { createRemoteBrowserSurface } from "../programs/awtsmoos-browser/remoteSurface.js";
import { createBrowserSurface } from "../programs/awtsmoos-browser/surface.js";
import { createFakeBrowserDocument } from "./browserSurfaceFixture.mjs";

function fixture() {
	const documentObject = createFakeBrowserDocument();
	const surface = createBrowserSurface(documentObject);
	const remote = createRemoteBrowserSurface(surface, documentObject);
	return { remote, surface };
}

test("back forward reload and Go mount beside the omnibox", () => {
	const { remote, surface } = fixture();
	assert.deepEqual(surface.navigationActions.children, [
		remote.back,
		remote.forward,
		remote.reload,
		remote.go
	]);
	assert.equal(remote.back.dataset.action, "back");
	assert.equal(remote.forward.dataset.action, "forward");
	assert.equal(remote.reload.dataset.action, "reload");
	assert.equal(remote.go.dataset.action, "go");
});

test("alias jar clearing and status live inside the advanced session slot", () => {
	const { remote, surface } = fixture();
	assert.deepEqual(surface.sessionPanel.children, [remote.row, remote.status]);
	assert.deepEqual(remote.row.children, [remote.alias, remote.jar, remote.clearJar]);
	assert.equal(remote.jar.value, "default");
	assert.equal(remote.clearJar.dataset.action, "clear-jar");
	assert.equal(remote.status.textContent, "Session idle · alias required");
});

test("remote surface reuses the one trusted omnibox instead of creating another address", () => {
	const { remote, surface } = fixture();
	assert.equal(remote.address, surface.address);
	assert.equal(remote.address.getAttribute("aria-label"), "Search or enter address");
	assert.equal(remote.alias.getAttribute("aria-label"), "Alias ID");
	assert.equal(remote.jar.getAttribute("aria-label"), "Cookie jar ID");
});
