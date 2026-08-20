//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves Chromium popup lineage becomes contained Geelooy browser windows exactly once.
 * @description The Awtsmoos turns opener and child into vessels sharing one guarded session;
 * Awtsmoos.com keeps OAuth children inside the virtual OS without duplicate window procession.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
	createInteractivePopupBridge,
	shouldOpen
} from "../programs/awtsmoos-browser/interactivePopupBridge.js";

test("only direct child targets qualify as popups for the current browser target", () => {
	const seen = new Set();
	assert.equal(shouldOpen({ targetId: "child", openerId: "root" }, "root", seen), true);
	assert.equal(shouldOpen({ targetId: "other", openerId: "elsewhere" }, "root", seen), false);
	assert.equal(shouldOpen({ targetId: "root", openerId: "root" }, "root", seen), false);
	seen.add("child");
	assert.equal(shouldOpen({ targetId: "child", openerId: "root" }, "root", seen), false);
});

test("popup bridge opens one awtsmoosBrowser window carrying the shared session target", () => {
	const windows = [];
	const bridge = createInteractivePopupBridge({
		aliasId: "asdf",
		jarId: "main",
		sessionId: "ibs_session",
		currentTargetId: "root",
		initialTargetIds: ["root"],
		os: {
			addWindow(options) {
				windows.push(options);
			}
		}
	});
	const targets = [
		{ targetId: "root", openerId: null, title: "Root" },
		{ targetId: "child", openerId: "root", title: "OAuth" },
		{ targetId: "stranger", openerId: "other", title: "Other" }
	];
	bridge.scan(targets);
	bridge.scan(targets);
	assert.equal(windows.length, 1);
	assert.equal(windows[0].programName, "awtsmoosBrowser");
	assert.deepEqual(windows[0].content, {
		interactiveAliasId: "asdf",
		interactiveJarId: "main",
		interactiveSessionId: "ibs_session",
		interactiveTargetId: "child"
	});
});
