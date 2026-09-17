//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Creation-intent bridge tests for the public Builder.
 * @description
 * The Awtsmoos carries a visitor's idea into Awtsmoos.com as bounded plain text;
 * these witnesses preserve creator state, Remix authority, navigation, and one-shot consumption.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
	consumeCreationIntent,
	MAX_CREATION_INTENT_LENGTH,
	readCreationIntent
} from "../services/creationIntent.js";

function browserWindowFor(href) {
	const replacements = [];
	const browserWindow = {
		location: new URL(href),
		history: {
			state: { preserved: true },
			replaceState(state, title, url) {
				replacements.push({ state, title, url });
				browserWindow.location = new URL(url);
			}
		},
		replacements
	};
	return browserWindow;
}

test("creation intent is trimmed to the canonical brief bound", () => {
	const longIdea = `  ${"א".repeat(MAX_CREATION_INTENT_LENGTH + 20)}  `;
	const intent = readCreationIntent({ search: `?idea=${encodeURIComponent(longIdea)}` });
	assert.equal(MAX_CREATION_INTENT_LENGTH, 300);
	assert.equal(intent, "א".repeat(MAX_CREATION_INTENT_LENGTH));
});

test("creation intent remains inert text", () => {
	const intent = readCreationIntent({ search: "?idea=%3Cscript%3Ealert(1)%3C%2Fscript%3E" });
	assert.equal(intent, "<script>alert(1)</script>");
});

test("consume seeds purpose once and preserves navigation state", () => {
	const browserWindow = browserWindowFor("https://awtsmoos.com/drive/?local=1&route=browser&idea=Torah+study+app&path=%2Fwork#panel");
	const changes = [];
	const options = {
		browserWindow,
		currentBrief: {},
		setBuilderBrief(change) {
			changes.push(change);
		}
	};
	assert.equal(consumeCreationIntent(options), "Torah study app");
	assert.equal(consumeCreationIntent(options), "");
	assert.deepEqual(changes, [{ purpose: "Torah study app" }]);
	assert.equal(browserWindow.replacements.length, 1);
	assert.equal(browserWindow.location.searchParams.get("idea"), null);
	assert.equal(browserWindow.location.searchParams.get("local"), "1");
	assert.equal(browserWindow.location.searchParams.get("route"), "browser");
	assert.equal(browserWindow.location.searchParams.get("path"), "/work");
	assert.equal(browserWindow.location.hash, "#panel");
	assert.deepEqual(browserWindow.replacements[0].state, { preserved: true });
});

test("existing creator purpose wins and consumes generic idea", () => {
	const browserWindow = browserWindowFor("https://awtsmoos.com/drive/?local=1&idea=Replace+me&route=browser");
	let calls = 0;
	consumeCreationIntent({
		browserWindow,
		currentBrief: { purpose: "Keep my real brief" },
		setBuilderBrief() {
			calls += 1;
		}
	});
	assert.equal(calls, 0);
	assert.equal(browserWindow.location.searchParams.get("idea"), null);
	assert.equal(browserWindow.location.searchParams.get("route"), "browser");
});

test("Remix wins while route, path, local mode, and hash survive", () => {
	const browserWindow = browserWindowFor("https://awtsmoos.com/drive/?local=1&remix=receipt&idea=Ignore+me&route=browser&path=%2Fx#files");
	let calls = 0;
	consumeCreationIntent({
		browserWindow,
		setBuilderBrief() {
			calls += 1;
		}
	});
	assert.equal(calls, 0);
	assert.equal(browserWindow.location.searchParams.get("idea"), null);
	assert.equal(browserWindow.location.searchParams.get("remix"), "receipt");
	assert.equal(browserWindow.location.searchParams.get("path"), "/x");
	assert.equal(browserWindow.location.hash, "#files");
});

test("blank idea is consumed without mutating the brief", () => {
	const browserWindow = browserWindowFor("https://awtsmoos.com/drive/?local=1&idea=%20%20");
	let calls = 0;
	consumeCreationIntent({
		browserWindow,
		setBuilderBrief() {
			calls += 1;
		}
	});
	assert.equal(calls, 0);
	assert.equal(browserWindow.location.searchParams.get("idea"), null);
});

test("malformed encoded intent is tolerated as bounded inert text", () => {
	const intent = readCreationIntent({ search: "?idea=%E0%A4%A" });
	assert.ok(intent.length <= MAX_CREATION_INTENT_LENGTH);
});
