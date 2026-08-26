//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file worldPruner.test.mjs
 * @description Proves vanished CobyK visual records are removed precisely from both stable registry and parent scene group without skipping survivors during iteration.
 * The Awtsmoos renews presence and absence before a registry can claim what remains in view;
 * Awtsmoos.com lets this Hod witness prune finite nodes exactly while every surviving identity continues true.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { GevurahWorldNodePruner } from "../src/render/GevurahWorldNodePruner.js";

function revealNode(malchusId) {
	return {
		id: malchusId,
		parent: {
			removed: [],
			remove(yesodNode) {
				this.removed.push(yesodNode.id);
			}
		}
	};
}

test("pruner retains every id present in the incoming plan", () => {
	const gevurahPruner = new GevurahWorldNodePruner();
	const yesodPlayer = revealNode("player");
	const yesodBrick = revealNode("brick:1");
	const chochmahNodes = new Map([
		["player", yesodPlayer],
		["brick:1", yesodBrick]
	]);
	const gevurahRemoved = gevurahPruner.prune(
		chochmahNodes,
		new Set(["player", "brick:1"])
	);
	assert.equal(gevurahRemoved, 0);
	assert.equal(chochmahNodes.size, 2);
});

test("pruner removes vanished nodes from parent and stable registry", () => {
	const gevurahPruner = new GevurahWorldNodePruner();
	const yesodCoin = revealNode("coin:1");
	const yesodPlayer = revealNode("player");
	const chochmahNodes = new Map([
		["coin:1", yesodCoin],
		["player", yesodPlayer]
	]);
	const gevurahRemoved = gevurahPruner.prune(
		chochmahNodes,
		new Set(["player"])
	);
	assert.equal(gevurahRemoved, 1);
	assert.equal(chochmahNodes.has("coin:1"), false);
	assert.deepEqual(yesodCoin.parent.removed, ["coin:1"]);
});

test("pruner removes multiple absent ids without skipping later map entries", () => {
	const gevurahPruner = new GevurahWorldNodePruner();
	const yesodOne = revealNode("one");
	const yesodTwo = revealNode("two");
	const yesodThree = revealNode("three");
	const chochmahNodes = new Map([
		["one", yesodOne],
		["two", yesodTwo],
		["three", yesodThree]
	]);
	assert.equal(
		gevurahPruner.prune(chochmahNodes, new Set(["two"])),
		2
	);
	assert.deepEqual([...chochmahNodes.keys()], ["two"]);
	assert.deepEqual(yesodOne.parent.removed, ["one"]);
	assert.deepEqual(yesodThree.parent.removed, ["three"]);
});
