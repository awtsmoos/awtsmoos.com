//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Native Browser Handoff Tests
 * @description The Awtsmoos proves a secure doorway opens only through the browser's
 * own top-level vessel; Awtsmoos.com severs opener authority, reports blocked doors,
 * and never needs provider cookies or cross-origin DOM testimony to know the result.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { openNativeBrowserHandoff } from "../programs/awtsmoos-browser/nativeBrowserHandoff.js";

test("opens blank top-level context, severs opener, then navigates and focuses", () => {
	const calls = [];
	const popup = {
		opener: { unsafe: true },
		location: {
			replace(url) {
				calls.push(["replace", url]);
			}
		},
		focus() {
			calls.push(["focus"]);
		}
	};
	const result = openNativeBrowserHandoff("https://accounts.google.com/", {
		openImpl(url, target) {
			calls.push(["open", url, target]);
			return popup;
		}
	});
	assert.deepEqual(calls, [
		["open", "about:blank", "_blank"],
		["replace", "https://accounts.google.com/"],
		["focus"]
	]);
	assert.equal(popup.opener, null);
	assert.equal(result.status, "opened");
	assert.equal(result.reason, "native-top-level");
});

test("reports popup blocking without attempting navigation", () => {
	const result = openNativeBrowserHandoff("https://example.com/", {
		openImpl: () => null
	});
	assert.equal(result.status, "blocked");
	assert.equal(result.reason, "popup-blocked");
});

test("reports unavailable or throwing window-open APIs", () => {
	assert.equal(
		openNativeBrowserHandoff("https://example.com/", { openImpl: null }).reason,
		"window-open-unavailable"
	);
	const thrown = openNativeBrowserHandoff("https://example.com/", {
		openImpl() {
			throw new Error("blocked");
		}
	});
	assert.equal(thrown.reason, "popup-open-error");
});

test("closes the popup when opener cannot be severed", () => {
	let closed = false;
	const popup = { location: { replace() {} }, close() { closed = true; } };
	Object.defineProperty(popup, "opener", {
		set() {
			throw new Error("sealed");
		}
	});
	const result = openNativeBrowserHandoff("https://example.com/", {
		openImpl: () => popup
	});
	assert.equal(result.reason, "opener-sever-failed");
	assert.equal(closed, true);
});

test("closes the popup when native navigation fails", () => {
	let closed = false;
	const popup = {
		opener: {},
		location: { replace() { throw new Error("navigation failed"); } },
		close() { closed = true; }
	};
	const result = openNativeBrowserHandoff("https://example.com/", {
		openImpl: () => popup
	});
	assert.equal(result.reason, "native-navigation-failed");
	assert.equal(closed, true);
});

test("blocks invalid and non-HTTP destinations before opening a window", () => {
	let opens = 0;
	const openImpl = () => { opens += 1; return {}; };
	assert.equal(openNativeBrowserHandoff("javascript:alert(1)", { openImpl }).status, "blocked");
	assert.equal(openNativeBrowserHandoff("file:///tmp/a", { openImpl }).status, "blocked");
	assert.equal(opens, 0);
});
