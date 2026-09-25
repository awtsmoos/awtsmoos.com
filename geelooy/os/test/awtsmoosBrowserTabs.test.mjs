//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Awtsmoos Browser tab-state and keyboard contracts.
 * @description The Awtsmoos lets many browsing threads remain distinct without becoming
 * unbounded; Awtsmoos.com proves creation, closure, cycling, titles, and familiar chords.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
	MAX_BROWSER_TABS,
	createBrowserTabStore,
	titleFromAddress
} from "../programs/awtsmoos-browser/browserTabState.js";
import { browserTabShortcut } from "../programs/awtsmoos-browser/browserTabKeyboard.js";

test("creates, activates, cycles, and closes independent tabs", () => {
	const store = createBrowserTabStore();
	const one = store.create();
	const two = store.create({ address: "https://two.example/path" });
	const three = store.create({ address: "https://three.example/" });
	assert.equal(store.active().id, three.id);
	assert.equal(store.activate(one.id).id, one.id);
	assert.equal(store.cycle(1).id, two.id);
	assert.equal(store.cycle(-1).id, one.id);
	store.close(one.id);
	assert.equal(store.active().id, two.id);
	assert.equal(store.all().length, 2);
});

test("bounds tab resources and keeps state snapshots isolated", () => {
	const store = createBrowserTabStore();
	for (let index = 0; index < MAX_BROWSER_TABS; index += 1) store.create();
	assert.equal(store.canCreate(), false);
	assert.throws(() => store.create(), error => error.code === "BROWSER_TAB_LIMIT");
	const snapshot = store.all();
	snapshot[0].title = "Mutated outside";
	assert.notEqual(store.all()[0].title, "Mutated outside");
});

test("derives compact trusted tab titles from addresses", () => {
	assert.equal(titleFromAddress("awtsmoos://new-tab"), "New Tab");
	assert.equal(titleFromAddress("https://awtsmoos.com/os/"), "awtsmoos.com");
	assert.equal(titleFromAddress("not a url"), "not a url");
});

test("maps familiar command/control tab shortcuts", () => {
	assert.equal(browserTabShortcut({ key: "t", metaKey: true }), "new");
	assert.equal(browserTabShortcut({ key: "W", ctrlKey: true }), "close");
	assert.equal(browserTabShortcut({ key: "Tab", ctrlKey: true }), "next");
	assert.equal(browserTabShortcut({ key: "Tab", ctrlKey: true, shiftKey: true }), "previous");
	assert.equal(browserTabShortcut({ key: "t" }), null);
	assert.equal(browserTabShortcut({ key: "t", ctrlKey: true, altKey: true }), null);
});
