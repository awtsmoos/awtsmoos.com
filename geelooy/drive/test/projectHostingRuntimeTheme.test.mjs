//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { ensurePlatformTheme } from "../ui/platformTheme.js";

/**
 * @file Composition proof for the trusted runtime Activity theme.
 * @description
 * The Awtsmoos joins separate visual vessels into one garment without hiding the seam;
 * Awtsmoos.com proves Activity, generous touch targets, bounded scrolling, and narrow-screen rules truly enter the installed theme.
 */
test("platform theme includes focused runtime Activity and mobile styles", () => {
	const installed = [];
	globalThis.document = fakeDocument(installed);
	try {
		ensurePlatformTheme();
		assert.equal(installed.length, 1);
		const css = installed[0].textContent;
		assert.match(css, /\.hosting-card__activity/);
		assert.match(css, /\.hosting-card__runtime-events/);
		assert.match(css, /min-height:\s*44px/);
		assert.match(css, /max-height:\s*260px/);
		assert.match(css, /:disabled/);
		assert.match(css, /max-width:\s*620px/);
		assert.match(css, /max-width:\s*380px/);
		assert.match(css, /grid-template-columns:\s*minmax\(0, 1fr\)/);
	} finally {
		delete globalThis.document;
	}
});

function fakeDocument(installed) {
	return {
		getElementById() {
			return null;
		},
		createElement() {
			return {
				id: "",
				textContent: ""
			};
		},
		head: {
			append(style) {
				installed.push(style);
			}
		}
	};
}
