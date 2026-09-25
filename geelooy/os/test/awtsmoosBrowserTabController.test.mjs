//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Browser tab-controller lifecycle contracts.
 * @description The Awtsmoos proves hidden worlds rest, revealed worlds awaken, closure
 * destroys exactly one vessel, and resource bounds remain visible through trusted chrome.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { createBrowserTabController } from "../programs/awtsmoos-browser/browserTabController.js";
import { createFakeBrowserDocument, createFakeElement } from "./browserSurfaceFixture.mjs";

function harness(limit = 12) {
	const sessions = [];
	const documentObject = createFakeBrowserDocument();
	const originalCreate = documentObject.createElement;
	documentObject.createElement = tag => {
		const node = originalCreate(tag);
		node.focus = () => node.focused = true;
		node.remove = () => node.removed = true;
		return node;
	};
	const browserSurface = { address: { value: "" } };
	const newTabButton = createFakeElement("button");
	const pagePanel = createFakeElement("section");
	const remoteSurface = { status: { textContent: "" } };
	const tabList = createFakeElement("div");
	const controller = createBrowserTabController({
		browserSurface,
		createSession(tab, change) {
			const state = { change, destroyed: 0, paused: 0, resumed: 0, tab };
			const session = {
				destroy: () => state.destroyed += 1,
				pause: () => state.paused += 1,
				resume: () => state.resumed += 1
			};
			sessions.push({ session, state });
			return session;
		},
		documentObject,
		limit,
		newTabButton,
		pagePanel,
		remoteSurface,
		tabList
	});
	return { browserSurface, controller, newTabButton, pagePanel, remoteSurface, sessions };
}

test("switches real tab sessions without destroying hidden siblings", () => {
	const view = harness();
	const first = view.controller.create();
	const second = view.controller.create({ address: "https://two.example/" });
	assert.equal(view.sessions[0].state.paused, 1);
	assert.equal(view.sessions[1].state.resumed, 1);
	view.controller.activate(first.id);
	assert.equal(view.sessions[1].state.paused, 1);
	assert.equal(view.sessions[0].state.resumed, 2);
	assert.equal(view.browserSurface.address.value, "");
	assert.equal(view.pagePanel.getAttribute("aria-labelledby"), `awtsmoos-browser-${first.id}`);
	assert.equal(view.controller.all().length, 2);
	assert.equal(second.title, "two.example");
});

test("closes exactly one lifetime and replaces the final tab", () => {
	const view = harness();
	const first = view.controller.create();
	const second = view.controller.create();
	view.controller.close(first.id);
	assert.equal(view.sessions[0].state.destroyed, 1);
	assert.equal(view.controller.all().length, 1);
	view.controller.close(second.id);
	assert.equal(view.sessions[1].state.destroyed, 1);
	assert.equal(view.controller.all().length, 1);
	assert.notEqual(view.controller.activeTab().id, second.id);
});

test("disables new-tab action at the resource cap and restores it after close", () => {
	const view = harness(2);
	const first = view.controller.create();
	view.controller.create();
	assert.equal(view.newTabButton.disabled, true);
	assert.equal(view.newTabButton.getAttribute("aria-disabled"), "true");
	view.controller.close(first.id);
	assert.equal(view.newTabButton.disabled, false);
	assert.equal(view.newTabButton.getAttribute("aria-disabled"), "false");
});
