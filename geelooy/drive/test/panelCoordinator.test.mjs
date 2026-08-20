//B"H
// Boruch Hashem
// Blessed is He

/** The Awtsmoos proves Build begins the phone journey and one primary vessel remains open at a time. */

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

function panel() {
	return {
		open: false,
		setOpen(value) {
			this.open = value;
		},
		focusSummary() {},
		scrollIntoView() {}
	};
}

test("phone defaults to Build and keeps infrastructure retracted", () => {
	const coordinator = new PanelCoordinator(preferences(), { mediaQuery: { matches: true } });
	assert.equal(coordinator.activeId, "builder");
	assert.equal(coordinator.initialOpen("builder"), true);
	assert.equal(coordinator.initialOpen("files"), false);
	assert.equal(coordinator.initialOpen("devices"), false);
});

test("opening one primary phone panel closes other primary panels", () => {
	const pref = preferences("builder");
	const coordinator = new PanelCoordinator(pref, { mediaQuery: { matches: true } });
	const builder = panel();
	const editor = panel();
	const access = panel();
	coordinator.register("builder", builder);
	coordinator.register("editor", editor);
	coordinator.register("access", access);
	builder.open = true;
	coordinator.open("editor");
	assert.equal(editor.open, true);
	assert.equal(builder.open, false);
	assert.equal(pref.active, "editor");
	assert.equal(access.open, false);
});

test("desktop opening a primary panel does not collapse siblings", () => {
	const coordinator = new PanelCoordinator(preferences(), { mediaQuery: { matches: false } });
	const builder = panel();
	const editor = panel();
	builder.open = true;
	coordinator.register("builder", builder);
	coordinator.register("editor", editor);
	coordinator.open("editor");
	assert.equal(builder.open, true);
	assert.equal(editor.open, true);
});
