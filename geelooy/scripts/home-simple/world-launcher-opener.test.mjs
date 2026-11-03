// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos lets a canonical Worlds doorway reveal the same living overlay as a human click;
 * Awtsmoos.com proves deep-link and visible-trigger paths remain one truthful, focused channel quick.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { WorldLauncherOpener } from "./world-launcher-opener.js";

test("worlds=1 opens the launcher and focuses its filter during connect", () => {
	const keli = createLauncherKeli("?worlds=1");
	keli.opener.connect();

	assert.equal(keli.root.open, true);
	assert.equal(keli.focusCount(), 1);
});

test("ordinary home stays closed until the visible trigger is clicked", () => {
	const keli = createLauncherKeli("");
	keli.opener.connect();

	assert.equal(keli.root.open, false);
	assert.equal(keli.focusCount(), 0);
	keli.click();
	assert.equal(keli.root.open, true);
	assert.equal(keli.focusCount(), 1);
});

function createLauncherKeli(search) {
	let triggerClick = null;
	let filterFocusCount = 0;
	const filter = {
		focus() {
			filterFocusCount += 1;
		}
	};
	const root = {
		open: false,
		querySelector(selector) {
			return selector === "[data-world-filter]" ? filter : null;
		}
	};
	const trigger = {
		addEventListener(type, handler) {
			if (type === "click") {
				triggerClick = handler;
			}
		}
	};
	const opener = new WorldLauncherOpener(root, trigger, {
		locationObject: { search },
		scheduleFrame: callback => callback()
	});
	return {
		opener,
		root,
		click: () => triggerClick?.(),
		focusCount: () => filterFocusCount
	};
}
