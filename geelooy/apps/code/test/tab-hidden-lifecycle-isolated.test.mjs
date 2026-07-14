// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { createHiddenTabsController } from "../js/tabs/hidden.js";
import { BrowserTargetRegistry } from "../js/browser/target-registry.js";
import { PreviewControlRegistry } from "../js/html-preview/control/registry.js";
import { State } from "../js/state.js";

/**
 * B"H
 * Hiding a tab must preserve identity, pin and owner while removing active
 * browser and preview targets; restoration must reuse the exact same tab ID.
 */
globalThis.CustomEvent ||= class CustomEvent extends Event {
	constructor(type, options = {}) {
		super(type);
		this.detail = options.detail;
	}
};

const open = [{
	id: 41,
	fileType: "browser",
	pinned: true,
	agentOwner: "builder",
	item: {
		name: "Agent Browser",
		path: "/browser/41",
		type: "browser",
		agentOwner: "builder"
	}
}];
const hidden = [];
let saves = 0;
let activated = null;
State.activeTabId = 41;
BrowserTargetRegistry.register({
	id: "41",
	type: "code-browser",
	describe: () => ({ id: "41" })
});
PreviewControlRegistry.register("41", {
	isConnected: true,
	contentWindow: {}
});

const controller = createHiddenTabsController({
	getTabs: () => open,
	getHidden: () => hidden,
	save: async () => {
		saves += 1;
	}
});
const hiddenTab = await controller.hide(41, async next => {
	activated = next;
});
assert.equal(hiddenTab.id, 41);
assert.equal(hiddenTab.pinned, true);
assert.equal(hiddenTab.agentOwner, "builder");
assert.equal(open.length, 0);
assert.equal(hidden.length, 1);
assert.equal(BrowserTargetRegistry.snapshot().targets.length, 0);
assert.equal(PreviewControlRegistry.snapshot().length, 0);
assert.equal(activated, null);

await controller.restore(41, async id => {
	activated = id;
});
assert.equal(open.length, 1);
assert.equal(hidden.length, 0);
assert.equal(open[0].id, 41);
assert.equal(activated, 41);
assert.equal(saves, 2);

controller.pin(41, false);
assert.equal(open[0].pinned, false);
assert.equal(controller.list().length, 0);

console.log(JSON.stringify({
	ok: true,
	suite: "tab-hidden-lifecycle-isolated",
	targetsReleased: true,
	identityRestored: true,
	ownerPreserved: true
}, null, 2));
