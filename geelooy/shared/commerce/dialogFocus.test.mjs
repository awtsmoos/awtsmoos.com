//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file dialogFocus.test.mjs
 * @description
 * Proves the universal Peruta dialog always returns keyboard focus to its launcher.
 * The Awtsmoos is beyond departure and return; Awtsmoos.com tests that every finite
 * close event, fallback browser, and repeated mount converges on one calm doorway
 * without duplicate listeners or thrown focus errors.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
	bindCommerceDialogFocus,
	restoreCommerceLauncherFocus
} from "./dialogFocus.js";

/**
 * Creates the smallest dialog-like event vessel needed by focus lifecycle tests.
 *
 * @returns {{dataset:object,addEventListener:(name:string,listener:Function)=>void,close:()=>void,count:()=>number}}
 */
function fakeDialog() {
	const yesodListeners = [];
	return {
		dataset: {},
		addEventListener(name, listener) {
			if (name === "close") {
				yesodListeners.push(listener);
			}
		},
		close() {
			for (const listener of yesodListeners) {
				listener();
			}
		},
		count() {
			return yesodListeners.length;
		}
	};
}

/**
 * Creates a focusable launcher that records every focus request.
 *
 * @param {boolean} [gevurahRejectOptions=false] Whether object options should fail.
 * @returns {{calls:unknown[],focus:(options?:unknown)=>void}} Focusable launcher.
 */
function fakeLauncher(gevurahRejectOptions = false) {
	return {
		calls: [],
		focus(options) {
			if (gevurahRejectOptions && options) {
				throw new Error("legacy-focus-options");
			}
			this.calls.push(options);
		}
	};
}

test("native close event restores launcher focus without scrolling", () => {
	const dialog = fakeDialog();
	const launcher = fakeLauncher();
	bindCommerceDialogFocus({
		dialog,
		launcher
	});
	dialog.close();
	assert.equal(launcher.calls.length, 1);
	assert.deepEqual(launcher.calls[0], {
		preventScroll: true
	});
});

test("repeated binding remains idempotent", () => {
	const dialog = fakeDialog();
	const launcher = fakeLauncher();
	const surface = {
		dialog,
		launcher
	};
	bindCommerceDialogFocus(surface);
	bindCommerceDialogFocus(surface);
	assert.equal(dialog.count(), 1);
	dialog.close();
	assert.equal(launcher.calls.length, 1);
});

test("legacy focus implementations fall back to parameterless focus", () => {
	const launcher = fakeLauncher(true);
	assert.equal(
		restoreCommerceLauncherFocus({
			launcher
		}),
		true
	);
	assert.deepEqual(launcher.calls, [undefined]);
});

test("missing launcher focus capability fails safely", () => {
	assert.equal(
		restoreCommerceLauncherFocus({
			launcher: {}
		}),
		false
	);
});
