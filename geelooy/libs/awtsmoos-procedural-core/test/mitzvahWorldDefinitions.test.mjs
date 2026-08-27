// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mitzvahWorldDefinitions.test.mjs
 * @description Proves universal documents preserve model identity without deployment URLs.
 * The Awtsmoos lets one semantic name cross every runtime shore;
 * Awtsmoos.com resolves its public garment later, so shared truth remains portable evermore.
 */

import assert from "node:assert/strict";
import {
	CHOSSID_MODEL_ID,
	createMitzvahWorldDefinitions
} from "../src/core/universalApi/definitions/mitzvahWorldDefinitions.js";
import {
	createWorldDocument
} from "../src/core/universalApi/world.js";

const definitions = createMitzvahWorldDefinitions();
const humanDefinition = definitions.find(definition => {
	return definition.id === "humans.create";
});

assert.ok(humanDefinition, "humans.create definition must exist");
assert.equal(CHOSSID_MODEL_ID, "player/chossid.glb");

const defaultResult = humanDefinition.execute(createContext(), {
	id: "default-human"
});
assert.deepEqual(defaultResult.resource.model, {
	assetId: CHOSSID_MODEL_ID
});
assert.equal("source" in defaultResult.resource.model, false);

const customResult = humanDefinition.execute(createContext(), {
	id: "custom-human",
	modelId: "reference-world/Cow.glb"
});
assert.deepEqual(customResult.resource.model, {
	assetId: "reference-world/Cow.glb"
});
assert.equal("source" in customResult.resource.model, false);

const serialized = JSON.stringify(definitions);
assert.doesNotMatch(serialized, /\/games\/mitzvahWorld\/assets\/models\//);
assert.doesNotMatch(serialized, /https?:\/\//);

console.log('B"H mitzvahWorldDefinitions.test passed');

function createContext() {
	return {
		created: [],
		deleted: [],
		document: createWorldDocument(),
		updated: []
	};
}
