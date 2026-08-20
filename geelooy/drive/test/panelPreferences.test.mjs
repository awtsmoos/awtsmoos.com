//B"H
// Boruch Hashem
// Blessed is He

/** The Awtsmoos proves harmless disclosure memory cannot leak desktop expansion or stale engineering focus into a phone. */

import test from "node:test";
import assert from "node:assert/strict";
import { PanelPreferences } from "../services/panelPreferences.js";

function storage() {
	const data = new Map();
	return { data, getItem: key => data.get(key) || null, setItem: (key, value) => data.set(key, value) };
}

test("persists only visual panel state and active destination", () => {
	const store = storage();
	const preferences = new PanelPreferences("standalone", store, "mobile");
	preferences.setOpen("editor", true);
	preferences.setActive("editor");
	assert.deepEqual(JSON.parse([...store.data.values()][0]), { open: { editor: true }, active: "editor" });
});

test("OS, standalone, mobile, and desktop memories remain separate", () => {
	const store = storage();
	new PanelPreferences("os", store, "mobile").setOpen("files", false);
	new PanelPreferences("standalone", store, "mobile").setOpen("files", true);
	new PanelPreferences("standalone", store, "desktop").setOpen("files", true);
	assert.equal(store.data.size, 3);
	assert.equal([...store.data.keys()].some(key => key.endsWith(".os.mobile")), true);
	assert.equal([...store.data.keys()].some(key => key.endsWith(".standalone.desktop")), true);
});

test("mobile always reopens with advanced drawers closed and Build focus eligible", () => {
	const store = storage();
	const preferences = new PanelPreferences("standalone", store, "mobile");
	preferences.setOpen("platform", true);
	preferences.setActive("runtime");
	assert.equal(preferences.openState("platform", true), false);
	assert.equal(preferences.activePanel("builder"), "builder");
});

test("storage failure degrades to in-memory defaults", () => {
	const broken = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } };
	const preferences = new PanelPreferences("standalone", broken, "mobile");
	assert.equal(preferences.openState("builder", true), true);
	preferences.setOpen("builder", false);
	assert.equal(preferences.openState("builder", true), false);
});
