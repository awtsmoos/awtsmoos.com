// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves the OS Workspace names browser-peer consent and authority truthfully.
 * @description
 * The Awtsmoos lets a Virtual OS vessel travel through a browser tab without calling
 * glass a native machine. Awtsmoos.com tests the rendered covenant directly: session,
 * remember, stop, forget, logical vessel, transport kind, and native-shell boundary
 * must remain visible even if the surrounding Workspace presentation evolves.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { peerSection } from "../workspaceViewSections.js";

function fakeDocument() {
	return {
		createElement() {
			return {
				className: "",
				innerHTML: ""
			};
		}
	};
}

test("peer section exposes explicit consent lifetime controls", () => {
	const section = peerSection(fakeDocument());
	assert.match(section.innerHTML, /Enable for this session/);
	assert.match(section.innerHTML, /Enable \+ remember/);
	assert.match(section.innerHTML, /Stop now/);
	assert.match(section.innerHTML, /Forget remembered permission/);
	assert.match(section.innerHTML, /data-peer-session/);
	assert.match(section.innerHTML, /data-peer-remember/);
	assert.match(section.innerHTML, /data-peer-stop/);
	assert.match(section.innerHTML, /data-peer-forget/);
});

test("peer section distinguishes Virtual OS from browser transport and native shell", () => {
	const section = peerSection(fakeDocument());
	assert.match(section.innerHTML, /Logical vessel:/);
	assert.match(section.innerHTML, /Virtual OS/);
	assert.match(section.innerHTML, /transport: browser tab/);
	assert.match(section.innerHTML, /no native shell authority/);
	assert.match(section.innerHTML, /aria-live="polite"/);
});
