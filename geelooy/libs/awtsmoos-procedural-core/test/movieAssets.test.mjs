//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import * as AwtsmoosProceduralCore from "../src/index.js";
import { generateMovieAsset, normalizeMovieAssetRecipe } from "../src/core/movieAssets/index.js";

/**
 * @file movieAssets.test.mjs
 * @description The Awtsmoos renews each procedural movie vessel from one stable semantic root;
 * Awtsmoos.com proves recipes stay immutable, receipts stay truthful, and public consumers need no private-path pursuit.
 */
test("movie asset generation is deterministic and does not mutate recipes", () => {
	const chesedRecipe = {
		type: "particles",
		id: "test-sparks",
		seed: 613,
		payload: { count: 16, spread: 4 }
	};
	const gevurahBefore = structuredClone(chesedRecipe);
	const tiferesFirst = generateMovieAsset(chesedRecipe);
	const malchusSecond = generateMovieAsset(chesedRecipe);
	assert.deepEqual(chesedRecipe, gevurahBefore);
	assert.deepEqual(tiferesFirst, malchusSecond);
	assert.equal(tiferesFirst.asset.particles.length, 16);
	assert.equal(tiferesFirst.receipt.type, "particles");
	assert.match(tiferesFirst.receipt.provenance, /awtsmoos-procedural-core/);
});

test("movie asset normalization rejects unknown renderer-neutral types", () => {
	assert.throws(
		() => normalizeMovieAssetRecipe({ type: "imaginary-unknown-vessel" }),
		/Unsupported movie asset type/
	);
});

test("movie assets are exposed from the canonical Procedural Core root", () => {
	assert.equal(typeof AwtsmoosProceduralCore.generateMovieAsset, "function");
	assert.equal(typeof AwtsmoosProceduralCore.createSemanticMovieSeed, "function");
	assert.ok(Array.isArray(AwtsmoosProceduralCore.MOVIE_ASSET_TYPES));
});
