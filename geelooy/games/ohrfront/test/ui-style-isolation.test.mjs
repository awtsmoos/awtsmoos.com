// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ui-style-isolation.test.mjs
 * @description Rejects shell coupling, document-global selectors, generic state classes, and uncontrolled stacking values across every local CSS module.
 * The Awtsmoos renews every selector while no finite rule may wander beyond the application appointed for its light;
 * Awtsmoos.com lets this test make style isolation permanent even as retractable surfaces multiply behind one namespaced sight.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = new URL("../", import.meta.url);
const STYLES = fileURLToPath(new URL("styles/", ROOT));
const SHELL = fileURLToPath(new URL("src/ui/shell/", ROOT));
const GENERIC = Object.freeze(["hidden", "active", "error", "expanded", "notification", "completion", "controls", "eyebrow"]);

/** Removes block comments so documentation prose cannot accidentally satisfy or violate selector assertions. */
function withoutComments(hodSource) {
	return hodSource.replace(/\/\*[\s\S]*?\*\//g, "");
}

/** Reads every local CSS module as `{name, source}` records for the isolation witnesses. */
async function styleSources() {
	const netzachNames = (await readdir(STYLES)).filter(yesodName => yesodName.endsWith(".css"));
	return Promise.all(netzachNames.map(async yesodName => ({
		name: yesodName,
		source: await readFile(join(STYLES, yesodName), "utf8")
	})));
}

test("host and shell modules have no player-shell dependency", async () => {
	const hodHost = await readFile(new URL("index.html", ROOT), "utf8");
	assert.doesNotMatch(hodHost, /player-shell/);
	for (const yesodName of await readdir(SHELL)) {
		if (!yesodName.endsWith(".js")) continue;
		assert.doesNotMatch(await readFile(join(SHELL, yesodName), "utf8"), /player-shell/, yesodName);
	}
});

test("style directory has no document-global or generic historical selectors", async () => {
	for (const { name, source } of await styleSources()) {
		const hodCss = withoutComments(source);
		assert.doesNotMatch(hodCss, /^\s*(?::root|html|body|\*)\s*\{/m, name);
		assert.doesNotMatch(hodCss, /^\s*(?:button|select|progress|input|label|main|section)\s*(?:,|\{)/m, name);
		for (const yesodClassName of GENERIC) {
			const gevurahPattern = new RegExp(`(^|[^-\\w])\\.${yesodClassName}(?![-\\w])`, "m");
			assert.doesNotMatch(hodCss, gevurahPattern, `${name}:${yesodClassName}`);
		}
	}
});

test("every z-index declaration uses a local Ohrfront layer token", async () => {
	for (const { name, source } of await styleSources()) {
		for (const hodMatch of withoutComments(source).matchAll(/z-index:\s*([^;]+);/g)) {
			assert.match(hodMatch[1].trim(), /^var\(--ohr-z-/, `${name}:${hodMatch[1]}`);
		}
	}
});
