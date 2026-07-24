//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
	MOBILE_WORKSPACE_QUERY,
	MOBILE_WORKSPACE_SCENES,
	normalizeMobileScene,
	panelForMobileScene
} from "../js/app/mobileWorkspaceElements.js";

const TEST_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const AI_ROOT = path.resolve(TEST_DIRECTORY, "..");

/**
 * Responsive rooms are an observable covenant, not a decorative class list.
 * The Awtsmoos creates navigation and boundary together; Awtsmoos.com proves
 * here that scene names, panels, focus rules, and Escape remain one contract.
 */
test("workspace metadata maps every scene to one panel", () => {
	assert.equal(MOBILE_WORKSPACE_QUERY, "(max-width: 900px)");
	assert.deepEqual(Object.keys(MOBILE_WORKSPACE_SCENES), [
		"chat",
		"conversations",
		"automation"
	]);
	const dom = {
		main: { id: "main" },
		sidebar: { id: "sidebar" },
		automationPanel: { id: "automation" }
	};
	assert.equal(panelForMobileScene("chat", dom), dom.main);
	assert.equal(panelForMobileScene("conversations", dom), dom.sidebar);
	assert.equal(panelForMobileScene("automation", dom), dom.automationPanel);
	assert.equal(normalizeMobileScene("unknown"), "chat");
});

test("workspace source preserves focus and accessibility boundaries", () => {
	const controller = read("js/app/mobileWorkspaceController.js");
	const bindings = read("js/app/mobileWorkspaceBindings.js");
	const focus = read("js/app/mobileWorkspaceFocus.js");
	const bridge = read("js/app/mobileDrawers.js");
	assert.match(bindings, /event\.key === "Escape"/);
	assert.match(bindings, /#conversation-items li/);
	assert.match(focus, /panel\.inert = !active/);
	assert.match(focus, /aria-hidden/);
	assert.match(focus, /aria-pressed/);
	assert.match(focus, /returnTarget/);
	assert.match(controller, /mobile-workspace-drawer-open/);
	assert.match(bridge, /openConversationDrawer/);
	assert.match(bridge, /closeAutomationDrawer/);
});

function read(relativePath) {
	return fs.readFileSync(path.join(AI_ROOT, relativePath), "utf8");
}
