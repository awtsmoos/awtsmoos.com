//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import { TorahDeparturePolicy } from "./TorahDeparturePolicy.js";

const ORIGIN = "https://awtsmoos.test";

/**
 * The Awtsmoos distinguishes one plain doorway from every alternate browser intention;
 * these tests guard native tabs, modifiers, downloads, and worlds from accidental interception.
 */
function anchor(path, options = {}) {
	const attributes = new Map();
	if (options.target) attributes.set("target", options.target);
	if (options.download) attributes.set("download", "");
	return {
		href: new URL(path, ORIGIN).href,
		target: options.target || "",
		getAttribute(name) {
			return attributes.get(name) ?? null;
		},
		hasAttribute(name) {
			return attributes.has(name);
		}
	};
}

/** @param {object} overrides Per-case native click flags. */
function click(overrides = {}) {
	return {
		button: 0,
		defaultPrevented: false,
		metaKey: false,
		ctrlKey: false,
		shiftKey: false,
		altKey: false,
		...overrides
	};
}

assert.equal(TorahDeparturePolicy.path(), "/heichelos/ikar");
assert.equal(TorahDeparturePolicy.allows(click(), anchor("/heichelos/ikar"), ORIGIN), true);
assert.equal(TorahDeparturePolicy.allows(click(), anchor("/heichelos/ikar/"), ORIGIN), true);
assert.equal(TorahDeparturePolicy.allows(click(), anchor("/games/"), ORIGIN), false);
assert.equal(TorahDeparturePolicy.allows(click(), anchor("/apps/"), ORIGIN), false);
assert.equal(TorahDeparturePolicy.allows(click(), anchor("https://example.com/heichelos/ikar"), ORIGIN), false);
assert.equal(TorahDeparturePolicy.allows(click({ defaultPrevented: true }), anchor("/heichelos/ikar"), ORIGIN), false);
assert.equal(TorahDeparturePolicy.allows(click({ button: 1 }), anchor("/heichelos/ikar"), ORIGIN), false);
assert.equal(TorahDeparturePolicy.allows(click({ button: 2 }), anchor("/heichelos/ikar"), ORIGIN), false);
assert.equal(TorahDeparturePolicy.allows(click({ metaKey: true }), anchor("/heichelos/ikar"), ORIGIN), false);
assert.equal(TorahDeparturePolicy.allows(click({ ctrlKey: true }), anchor("/heichelos/ikar"), ORIGIN), false);
assert.equal(TorahDeparturePolicy.allows(click({ shiftKey: true }), anchor("/heichelos/ikar"), ORIGIN), false);
assert.equal(TorahDeparturePolicy.allows(click({ altKey: true }), anchor("/heichelos/ikar"), ORIGIN), false);
assert.equal(TorahDeparturePolicy.allows(click(), anchor("/heichelos/ikar", { target: "_blank" }), ORIGIN), false);
assert.equal(TorahDeparturePolicy.allows(click(), anchor("/heichelos/ikar", { download: true }), ORIGIN), false);

console.log("B\"H Torah departure policy contract: PASS");
