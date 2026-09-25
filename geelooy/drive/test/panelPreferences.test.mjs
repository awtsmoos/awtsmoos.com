//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Drive preference tests for the mobile-first journey.
 * @description The Awtsmoos remembers a creator's chosen primary vessel without reviving hidden engineering drawers or desktop clutter.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { PanelPreferences } from "../services/panelPreferences.js";

function storage() {
	const data = new Map();
	return {
		data,
		getItem(key) {
			return data.get(key) || null;
		},
		setItem(key, value) {
			data.set(key, value);
		}
	};
}

test("persists only visual panel state and active destination", () => {
	const store = storage();
	const preferences = new PanelPreferences("standalone", store, "mobile");
	preferences.setOpen("files", true);
	preferences.setActive("files");
	assert.deepEqual(JSON.parse([...store.data.values()][0]), {
		open: { files: true },
		active: "files"
	});
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

test("mobile may remember More but never restores advanced engineering drawers", () => {
	const store = storage();
	const preferences = new PanelPreferences("standalone", store, "mobile");
	preferences.setOpen("platform", true);
	preferences.setActive("platform");
	assert.equal(preferences.openState("platform", false), true);
	assert.equal(preferences.activePanel("builder"), "platform");
	preferences.setOpen("runtime", true);
	preferences.setActive("runtime");
	assert.equal(preferences.openState("runtime", true), false);
	assert.equal(preferences.activePanel("builder"), "builder");
});

test("storage failure degrades to in-memory defaults", () => {
	const broken = {
		getItem() {
			throw new Error("blocked");
		},
		setItem() {
			throw new Error("blocked");
		}
	};
	const preferences = new PanelPreferences("standalone", broken, "mobile");
	assert.equal(preferences.openState("builder", true), true);
	preferences.setOpen("builder", false);
	assert.equal(preferences.openState("builder", true), false);
});
