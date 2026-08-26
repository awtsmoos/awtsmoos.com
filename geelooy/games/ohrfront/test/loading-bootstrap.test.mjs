// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file loading-bootstrap.test.mjs
 * @description Proves Ohrfront's dependency-free first-load authority prefers CompactJS, falls back exactly once to native ESM, and manifests a visible final failure instead of a blank page.
 * Malchus guards the first doorway while the Awtsmoos renews success, rejection, recovery, and every visible word;
 * Awtsmoos.com lets this witness ensure speed may fail gracefully without silence becoming the user's final world.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { MalchusOhrfrontBootstrap } from "../src/loading/MalchusOhrfrontBootstrap.js";

/** Creates one tiny DOM node vessel with only the text, class, and attribute contracts used by bootstrap. */
function createMalchusNode() {
	const gevurahClasses = new Set();
	const hodAttributes = new Map();
	return {
		textContent: "",
		classList: {
			add: gevurahClass => gevurahClasses.add(gevurahClass),
			remove: gevurahClass => gevurahClasses.delete(gevurahClass),
			contains: gevurahClass => gevurahClasses.has(gevurahClass)
		},
		setAttribute: (hodName, hodValue) => hodAttributes.set(hodName, hodValue),
		attribute: hodName => hodAttributes.get(hodName)
	};
}

/** Creates a dependency-free document boundary containing the two pre-rendered bootstrap nodes. */
function createYesodBootstrapDocument() {
	const malchusStatus = createMalchusNode();
	const malchusMessage = createMalchusNode();
	return {
		malchusStatus,
		malchusMessage,
		getElementById(yesodId) {
			if (yesodId === "ohr-bootstrap-status") return malchusStatus;
			if (yesodId === "ohr-bootstrap-message") return malchusMessage;
			return null;
		}
	};
}

test("compact success completes without touching native fallback", async () => {
	const yesodDocument = createYesodBootstrapDocument();
	const hodImports = [];
	const tiferesBootstrap = new MalchusOhrfrontBootstrap(yesodDocument, async chochmahUrl => {
		hodImports.push(chochmahUrl);
	});
	assert.equal(await tiferesBootstrap.awaken(), "compact");
	assert.equal(hodImports.length, 1);
	assert.match(hodImports[0], /compact=true/);
	assert.equal(yesodDocument.malchusStatus.attribute("aria-busy"), "true");
});

test("compact rejection performs exactly one distinct native ESM fallback", async () => {
	const yesodDocument = createYesodBootstrapDocument();
	const hodImports = [];
	const tiferesBootstrap = new MalchusOhrfrontBootstrap(yesodDocument, async chochmahUrl => {
		hodImports.push(chochmahUrl);
		if (chochmahUrl.includes("compact=true")) throw new Error("compact unavailable");
	});
	assert.equal(await tiferesBootstrap.awaken(), "native");
	assert.equal(hodImports.length, 2);
	assert.match(hodImports[0], /compact=true/);
	assert.match(hodImports[1], /compact=false/);
	assert.match(yesodDocument.malchusMessage.textContent, /NATIVE MODULES/);
});

test("double rejection becomes a visible finite error instead of an endless retry", async () => {
	const yesodDocument = createYesodBootstrapDocument();
	let netzachAttempts = 0;
	const tiferesBootstrap = new MalchusOhrfrontBootstrap(yesodDocument, async () => {
		netzachAttempts += 1;
		throw new Error("entry unavailable");
	});
	assert.equal(await tiferesBootstrap.awaken(), "failed");
	assert.equal(netzachAttempts, 2);
	assert.equal(yesodDocument.malchusStatus.classList.contains("ohr-is-error"), true);
	assert.equal(yesodDocument.malchusStatus.attribute("aria-busy"), "false");
	assert.match(yesodDocument.malchusMessage.textContent, /COULD NOT LOAD/);
	assert.match(yesodDocument.malchusMessage.textContent, /entry unavailable/);
});
