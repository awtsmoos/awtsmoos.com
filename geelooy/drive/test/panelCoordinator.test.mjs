//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Mobile Drive screen coordination tests.
 * @description The Awtsmoos proves one mobile intention becomes one visible screen while desktop keeps its wider disclosure freedom.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { PanelCoordinator } from "../services/panelCoordinator.js";

function preferences(active = "") {
	return {
		open: {},
		active,
		openState(id, fallback) {
			return this.open[id] ?? fallback;
		},
		setOpen(id, value) {
			this.open[id] = value;
		},
		activePanel(fallback) {
			return this.active || fallback;
		},
		setActive(id) {
			this.active = id;
		}
	};
}

function panel(open = false) {
	return {
		open,
		focuses: 0,
		isOpen() {
			return this.open;
		},
		setOpen(value) {
			this.open = value;
		},
		focusSummary() {
			this.focuses += 1;
		},
		scrollIntoView() {}
	};
}

test("mobile starts with only the remembered primary screen open", () => {
	const coordinator = new PanelCoordinator(preferences("files"), { matches: true });
	assert.equal(coordinator.activeId, "files");
	assert.equal(coordinator.initialOpen("files"), true);
	assert.equal(coordinator.initialOpen("builder"), false);
	assert.equal(coordinator.initialOpen("platform"), false);
});

test("mobile navigation closes every previous screen including advanced panels", () => {
	const pref = preferences("builder");
	const coordinator = new PanelCoordinator(pref, { matches: true });
	const builder = panel(true);
	const access = panel(true);
	const files = panel(false);
	coordinator.register("builder", builder);
	coordinator.register("access", access);
	coordinator.register("files", files);
	coordinator.open("files", { focus: true });
	assert.equal(files.open, true);
	assert.equal(builder.open, false);
	assert.equal(access.open, false);
	assert.equal(pref.active, "files");
	assert.equal(files.focuses, 0);
});

test("advanced mobile screen replaces the current primary screen", () => {
	const pref = preferences("builder");
	const coordinator = new PanelCoordinator(pref, { matches: true });
	const builder = panel(true);
	const domain = panel(false);
	coordinator.register("builder", builder);
	coordinator.register("domain", domain);
	coordinator.open("domain");
	assert.equal(builder.open, false);
	assert.equal(domain.open, true);
	assert.equal(pref.active, "domain");
});

test("desktop opening another panel preserves already open siblings", () => {
	const coordinator = new PanelCoordinator(preferences(), { matches: false });
	const builder = panel(true);
	const editor = panel(false);
	coordinator.register("builder", builder);
	coordinator.register("editor", editor);
	coordinator.open("editor", { focus: true });
	assert.equal(builder.open, true);
	assert.equal(editor.open, true);
	assert.equal(editor.focuses, 1);
});
