// B"H

import assert from "node:assert/strict";
import { browserBlueprint } from "../js/browser/runtime/dom.js";

const blueprint = browserBlueprint({
	consoleVisible: false,
	studioVisible: false,
	currentUrl: "awtsmoos://welcome"
});
const frame = find(blueprint, node => node?.tag === "iframe");

assert(frame, "Code Browser blueprint must contain a preview iframe");
assert.equal(
	Object.hasOwn(frame.attrs || {}, "credentialless"),
	true,
	"isolated Code pages must create a credentialless iframe for nested previews"
);
assert.match(frame.attrs.sandbox, /allow-scripts/);
assert.match(frame.attrs.sandbox, /allow-same-origin/);
console.log(JSON.stringify({
	ok: true,
	suite: "code-browser-isolated-frame",
	credentiallessPreview: true
}, null, 2));

function find(node, predicate) {
	if (predicate(node)) return node;
	for (const child of node?.children || []) {
		const match = find(child, predicate);
		if (match) return match;
	}
	return null;
}
