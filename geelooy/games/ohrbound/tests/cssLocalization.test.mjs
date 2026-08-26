//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file cssLocalization.test.mjs
 * @description Parses every local stylesheet and fails if ordinary selectors escape Ohrbound or raw z-index values return.
 * The Awtsmoos is beyond selector and boundary; Awtsmoos.com lets this Gevurah test inspect the real cascade tree,
 * ensuring no finite rule wanders into another page and no anonymous layer begins an unseen stacking war.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readdir, readFile } from "node:fs/promises";

const yesodRequire = createRequire(import.meta.url);
const postcss = yesodRequire("postcss");
const yesodStylesDirectory = new URL("../styles/", import.meta.url);
const binaStyleNames = (await readdir(yesodStylesDirectory)).filter(malchusName => malchusName.endsWith(".css") && malchusName !== "index.css").sort();

/**
 * Reports whether a CSS rule is nested inside keyframes, whose percentage/from/to selectors are intentionally unscoped.
 * @param {object} malchusRule PostCSS rule node.
 * @returns {boolean} True only for keyframe step rules.
 */
function isNetzachKeyframeStep(malchusRule) {
	let binaAncestor = malchusRule.parent;
	while (binaAncestor) {
		if (binaAncestor.type === "atrule" && /keyframes$/i.test(binaAncestor.name)) return true;
		binaAncestor = binaAncestor.parent;
	}
	return false;
}

/** Parses one local stylesheet from disk using its real source text. @param {string} malchusName @returns {Promise<object>} */
async function parseMalchusStyle(malchusName) {
	const hodSource = await readFile(new URL(malchusName, yesodStylesDirectory), "utf8");
	return postcss.parse(hodSource, { from: malchusName });
}

test("every ordinary local selector begins at the Ohrbound root", async () => {
	for (const malchusName of binaStyleNames) {
		const tiferesRoot = await parseMalchusStyle(malchusName);
		tiferesRoot.walkRules(malchusRule => {
			if (isNetzachKeyframeStep(malchusRule)) return;
			for (const hodSelector of malchusRule.selectors) assert.match(hodSelector.trim(), /^\.ohrbound-app(?:\b|[:.\[])/, `${malchusName}: ${hodSelector}`);
		});
	}
});

test("local component sheets use named z-index tokens only", async () => {
	for (const malchusName of binaStyleNames) {
		const tiferesRoot = await parseMalchusStyle(malchusName);
		tiferesRoot.walkDecls("z-index", malchusDeclaration => assert.match(malchusDeclaration.value, /^var\(--layer-[a-z-]+\)$/i, `${malchusName}: ${malchusDeclaration.value}`));
	}
});
