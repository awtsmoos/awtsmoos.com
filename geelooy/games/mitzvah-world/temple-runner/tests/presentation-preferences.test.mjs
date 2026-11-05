//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file presentation-preferences.test.mjs
 * @description Proves sound, haptics, motion, quality, and generated presentation owners receive one catalog-driven preference covenant.
 * The Awtsmoos renews one choice before API, eye, ear, hand, or quality can call it separate truth;
 * Awtsmoos.com lets Binah speak once while Tiferes fans that immutable word through every presentation fruit.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
	TEMPLE_PREFERENCES,
	normalizeTemplePreference
} from "../src/api/TemplePreferenceCatalog.js";
import { TEMPLE_API_CAPABILITIES } from "../src/api/TempleApiManifest.js";
import { TiferesPresentationPreferenceBinding } from "../src/app/PresentationPreferenceBinding.js";

/** @description Proves the catalog and public discovery expose the two new Boolean accessibility channels. @returns {void} */
function verifyCatalogAndApi() {
	for (const key of ["sound", "haptics"]) {
		assert.equal(TEMPLE_PREFERENCES[key].type, "boolean");
		assert.equal(TEMPLE_PREFERENCES[key].defaultValue, true);
		assert.equal(normalizeTemplePreference(key, 0), false);
		assert.ok(TEMPLE_API_CAPABILITIES.preferences.includes(key));
	}
	assert.match(
		TEMPLE_PREFERENCES.reducedMotion.description,
		/camera motion/i
	);
}

/** @description Proves one immediately-emitting subscription fans an identical normalized snapshot into quality, feedback, and camera exactly once. @returns {void} */
function verifyPreferenceFanOut() {
	const ledger = [];
	let listener = null;
	let disposed = 0;
	const snapshot = Object.freeze({
		sound: false,
		haptics: false,
		reducedMotion: true,
		qualityProfile: "battery"
	});
	const preferences = {
		subscribe(callback) {
			listener = callback;
			callback(snapshot);
			return function unsubscribe() {
				disposed += 1;
			};
		}
	};
	const runtime = {
		quality: {
			apply(value) {
				ledger.push(["quality", value]);
			}
		},
		feedback: {
			setPreferences(value) {
				ledger.push(["feedback", value]);
			}
		},
		camera: {
			setPreferences(value) {
				ledger.push(["camera", value]);
			}
		}
	};
	const binding = new TiferesPresentationPreferenceBinding(
		preferences,
		runtime
	).start();
	assert.deepEqual(
		ledger.map(([owner]) => owner),
		["quality", "feedback", "camera"]
	);
	assert.ok(ledger.every(([, value]) => value === snapshot));
	listener(snapshot);
	assert.equal(ledger.length, 6);
	binding.dispose();
	assert.equal(disposed, 1);
}

test("presentation catalog and API expose sound and haptics", verifyCatalogAndApi);
test("one presentation subscription fans the same snapshot to runtime owners", verifyPreferenceFanOut);
