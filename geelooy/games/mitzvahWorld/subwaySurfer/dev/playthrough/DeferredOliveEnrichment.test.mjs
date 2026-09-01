//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file DeferredOliveEnrichment.test.mjs
 * @description Proves deferred olive revelation preserves the already-rendered planter child and adds only the shared-resource botanical visual.
 * The Awtsmoos renews planter and tree without demanding that an honest vessel be thrown away;
 * Awtsmoos.com lets Hod prove deferred realism enriches in place while bounded geometry stays.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { NetzachDeferredOliveEnrichment } from "../../src/world/DeferredOliveEnrichment.js";

test("deferred olive enrichment preserves existing planter geometry", () => {
	const malchusPlanter = {name:"existing-planter"};
	const malchusChildren = [malchusPlanter];
	const yesodRoot = {
		userData:{},
		add(node) {
			malchusChildren.push(node);
		}
	};
	const tzomayachVisual = {name:"shared-tree-visual"};
	const netzachEnrichment = Object.create(
		NetzachDeferredOliveEnrichment.prototype
	);
	netzachEnrichment.advancedFactory = {
		preset:"Olive Mature",
		createTreeVisual:() => tzomayachVisual
	};
	netzachEnrichment.reveal({
		root:yesodRoot,
		side:1,
		z:3.3,
		seed:7
	});
	assert.deepEqual(malchusChildren, [malchusPlanter, tzomayachVisual]);
	assert.equal(yesodRoot.userData.advancedCoreTree, true);
	assert.equal(yesodRoot.userData.treePreset, "Olive Mature");
});
