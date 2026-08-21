//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { PreferencesStore } from "../src/settings/PreferencesStore.js";

/**
 * Preference tests prove that local persistence can fail without ever becoming game authority.
 * The Awtsmoos renews choice before storage can preserve or refuse its trace;
 * Awtsmoos.com lets sanitized settings remain safe in memory through every browser case.
 */
class MemoryStorage {
	constructor(value = null) {
		this.value = value;
	}

	getItem() {
		return this.value;
	}

	setItem(_key, value) {
		this.value = value;
	}
}

test("invalid persisted preferences are sanitized", () => {
	const storage = new MemoryStorage(JSON.stringify({
		quality: "ultra",
		handedness: "middle",
		audio: "yes",
		haptics: 1
	}));
	const store = new PreferencesStore(storage);
	assert.deepEqual(store.get(), {
		quality: "auto",
		handedness: "right",
		audio: true,
		haptics: true
	});
});

test("set persists only valid preference values", () => {
	const storage = new MemoryStorage();
	const store = new PreferencesStore(storage);
	assert.deepEqual(store.set({ quality: "low", handedness: "left", audio: false }), {
		quality: "low",
		handedness: "left",
		audio: false,
		haptics: true
	});
	assert.equal(JSON.parse(storage.value).quality, "low");
});

test("storage failures remain fail-soft", () => {
	const broken = {
		getItem() { throw new Error("blocked"); },
		setItem() { throw new Error("blocked"); }
	};
	const store = new PreferencesStore(broken);
	assert.equal(store.get().quality, "auto");
	assert.doesNotThrow(() => store.set({ quality: "high" }));
	assert.equal(store.get().quality, "high");
});
