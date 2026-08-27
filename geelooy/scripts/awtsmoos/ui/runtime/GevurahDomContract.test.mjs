// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file GevurahDomContract.test.mjs
 * @description
 * The Awtsmoos needs no selector to know a vessel, yet Awtsmoos.com proves its finite
 * Gevurah boundary with exact witnesses: required truth, peaceful optional absence,
 * immutable collections, and failures whose words lead a future developer home.
 */
import assert from "node:assert/strict";
import { GevurahDomContract } from "./GevurahDomContract.js";

/**
 * Builds a tiny deterministic query root for contract testing without browser globals.
 *
 * @param {Record<string, unknown>} singularNodes Nodes returned by querySelector.
 * @param {Record<string, ReadonlyArray<unknown>>} collectionNodes Nodes returned by querySelectorAll.
 * @returns {{querySelector(selector:string):unknown,querySelectorAll(selector:string):ReadonlyArray<unknown>}} Fake query-capable root.
 */
function createGevurahRoot(singularNodes = {}, collectionNodes = {}) {
	return {
		querySelector(gevurahSelector) {
			return singularNodes[gevurahSelector] || null;
		},
		querySelectorAll(gevurahSelector) {
			return collectionNodes[gevurahSelector] || [];
		}
	};
}

const requiredNode = Object.freeze({ id: "required-node" });
const collectionSource = [{ id: 1 }, { id: 2 }];
const gevurahRoot = createGevurahRoot(
	{ "[data-required]": requiredNode },
	{ "[data-many]": collectionSource }
);
const gevurah = new GevurahDomContract(gevurahRoot, "Contract Test");

assert.equal(gevurah.require("[data-required]", "required witness"), requiredNode);
assert.equal(gevurah.optional("[data-missing]"), null);

const immutableMany = gevurah.all("[data-many]");
assert.deepEqual(immutableMany, collectionSource);
assert.equal(Object.isFrozen(immutableMany), true);
collectionSource.push({ id: 3 });
assert.equal(immutableMany.length, 2, "collection must remain a stable snapshot");

assert.throws(
	() => gevurah.require("[data-lost]", "lost light"),
	(error) => {
		assert.match(error.message, /Contract Test/);
		assert.match(error.message, /lost light/);
		assert.match(error.message, /\[data-lost\]/);
		return true;
	}
);
assert.throws(
	() => new GevurahDomContract({}, "Broken Root"),
	(error) => error instanceof TypeError && /Broken Root/.test(error.message)
);

console.log('B"H GevurahDomContract.test passed');
