//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file cssLocalization.test.mjs
 * @description Parses every local stylesheet and fails if ordinary selectors escape Ohrbound or raw z-index values return.
 * The Awtsmoos is beyond selector and boundary; Awtsmoos.com lets this Gevurah test inspect the real cascade tree,
 * ensuring no finite rule wanders into another page and no anonymous layer begins an unseen stacking war.
 *
 * B"H — 2026-10-13: the package is dependency-free by declaration, so this
 * test walks the cascade with a tiny built-in brace scanner instead of
 * postcss (which was never installed and crashed the suite on load).
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";

const yesodStylesDirectory = new URL("../styles/", import.meta.url);
const binaStyleNames = (await readdir(yesodStylesDirectory)).filter(malchusName => malchusName.endsWith(".css") && malchusName !== "index.css").sort();

/** Splits a selector list on top-level commas only (never inside :is()/:not() parens). */
function yesodSplitSelectors(hodHeader) {
	const hodSelectors = [];
	let hodDepth = 0;
	let hodCurrent = "";
	for (const hodChar of hodHeader) {
		if (hodChar === "(") hodDepth += 1;
		else if (hodChar === ")") hodDepth = Math.max(0, hodDepth - 1);
		if (hodChar === "," && hodDepth === 0) {
			hodSelectors.push(hodCurrent.trim());
			hodCurrent = "";
			continue;
		}
		hodCurrent += hodChar;
	}
	if (hodCurrent.trim()) hodSelectors.push(hodCurrent.trim());
	return hodSelectors;
}
/** Strips block comments so braces inside them cannot confuse the scanner. */
function yesodStripComments(hodSource) {
	return hodSource.replace(/\/\*[\s\S]*?\*\//g, "");
}

/**
 * Yields one { selectors, declarations } per ordinary rule in the CSS text.
 * Keyframe steps are skipped (intentionally unscoped); @media bodies recurse.
 */
function* yesodWalkRules(hodSource) {
	const hodText = yesodStripComments(hodSource);
	let hodIndex = 0;
	const hodLength = hodText.length;
	while (hodIndex < hodLength) {
		const hodOpen = hodText.indexOf("{", hodIndex);
		if (hodOpen < 0) break;
		const hodHeader = hodText.slice(hodIndex, hodOpen).trim();
		let hodDepth = 1;
		let hodClose = hodOpen + 1;
		while (hodClose < hodLength && hodDepth > 0) {
			if (hodText[hodClose] === "{") hodDepth += 1;
			else if (hodText[hodClose] === "}") hodDepth -= 1;
			hodClose += 1;
		}
		const hodBody = hodText.slice(hodOpen + 1, hodClose - 1);
		hodIndex = hodClose;
		if (/^@/.test(hodHeader)) {
			if (/keyframes$/i.test(hodHeader.split(/\s+/)[0])) continue;
			yield* yesodWalkRules(hodBody);
			continue;
		}
		const hodSelectors = yesodSplitSelectors(hodHeader).filter(Boolean);
		if (hodSelectors.length) yield { selectors: hodSelectors, declarations: hodBody };
	}
}

test("every ordinary local selector begins at the Ohrbound root", async () => {
	for (const malchusName of binaStyleNames) {
		const hodSource = await readFile(new URL(malchusName, yesodStylesDirectory), "utf8");
		for (const hodRule of yesodWalkRules(hodSource)) {
			for (const hodSelector of hodRule.selectors) {
				// B"H — :root:root:root is the sanctioned specificity ladder
				// (no !important, per the tunnel laws); it still only reaches
				// beneath .ohrbound-app, so it never escapes the game.
				const hodScoped = hodSelector.replace(/^:root(?::root)*\s+/, "");
				assert.match(hodScoped, /^\.ohrbound-app(?:\b|[:.\[])/, `${malchusName}: ${hodSelector}`);
			}
		}
	}
});

test("local component sheets use named z-index tokens only", async () => {
	for (const malchusName of binaStyleNames) {
		const hodSource = await readFile(new URL(malchusName, yesodStylesDirectory), "utf8");
		for (const hodRule of yesodWalkRules(hodSource)) {
			for (const hodDeclaration of hodRule.declarations.matchAll(/z-index\s*:\s*([^;!}]+)/gi)) {
				assert.match(hodDeclaration[1].trim(), /^var\(--layer-[a-z-]+\)$/i, `${malchusName}: ${hodDeclaration[1].trim()}`);
			}
		}
	}
});
