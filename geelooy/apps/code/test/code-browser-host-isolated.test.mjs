// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { resolveBrowserHost } from "../js/browser/browser-host.js";

function host() {
	return {
		classList: {
			add() {}
		},
		replaceChildren() {}
	};
}

const explicit = host();
assert.equal(resolveBrowserHost(explicit), explicit);

const canonical = host();
const documentObject = {
	getElementById(id) {
		return id === "browser-wrapper" ? canonical : null;
	}
};
assert.equal(resolveBrowserHost(null, { document: documentObject }), canonical);
assert.throws(
	() => resolveBrowserHost(null, { document: { getElementById() { return null; } } }),
	/code_browser_host_missing/
);

console.log(JSON.stringify({
	ok: true,
	suite: "code-browser-host-isolated",
	explicitHost: true,
	canonicalFallback: true,
	missingHostRejected: true
}, null, 2));
