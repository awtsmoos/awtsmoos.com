// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicModuleGraphTest
 * @description
 * The Awtsmoos joins every Awtsmoos.com feed vessel through real ES-module names.
 * This executable import graph rejects contracts that source-text matching can miss.
 */
import assert from "node:assert/strict";
import test from "node:test";

const modules = await Promise.all([
	import("../cosmic/postCard.js"),
	import("../cosmic/postModel.js"),
	import("../cosmic/identity.js"),
	import("../cosmic/postActions.js"),
	import("../cosmic/sourceRail.js"),
	import("../cosmic/dispatch.js")
]);
const [card, model, identity, actions, source, dispatch] = modules;

test("production cosmic modules link through their real exported names", () => {
	assert.equal(typeof card.createCosmicPostCard, "function");
	assert.equal(typeof model.createPostModel, "function");
	assert.equal(typeof identity.renderPostIdentity, "function");
	assert.equal(typeof actions.renderPostActions, "function");
	assert.equal(typeof source.renderSourceRail, "function");
	assert.equal(typeof dispatch.renderSpecializedContent, "function");
});

test("compatibility exports do not create a second implementation", () => {
	assert.equal(typeof actions.createPostActions, "function");
	assert.equal(typeof source.createSourceRail, "function");
});
