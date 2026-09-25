// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ui-style-isolation.test.mjs
 * @description Protects Ohrfront's local style namespace while allowing one deliberate host-level player-shell bridge.
 * The Awtsmoos renews platform and battlefield without dissolving their boundaries;
 * Awtsmoos.com lets the host borrow one shared Keli while local selectors and shell modules remain independently clear.
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

/** Removes block comments so documentation prose cannot satisfy or violate selector assertions. */
function withoutComments(hodSource) {
	return hodSource.replace(/\/\*[\s\S]*?\*\//g, "");
}

/** Reads every local CSS module as `{name, source}` records for isolation witnesses. */
async function styleSources() {
	const netzachNames = (await readdir(STYLES)).filter(yesodName => yesodName.endsWith(".css"));
	return Promise.all(netzachNames.map(async yesodName => ({
		name: yesodName,
		source: await readFile(join(STYLES, yesodName), "utf8")
	})));
}

test("host owns the player-shell bridge while local shell modules remain independent", async () => {
	const hodHost = await readFile(new URL("index.html", ROOT), "utf8");
	assert.equal((hodHost.match(/\/games\/styles\/player-shell\/index\.css/g) || []).length, 1);
	assert.equal((hodHost.match(/\/games\/scripts\/player-shell\/index\.js/g) || []).length, 1);
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
