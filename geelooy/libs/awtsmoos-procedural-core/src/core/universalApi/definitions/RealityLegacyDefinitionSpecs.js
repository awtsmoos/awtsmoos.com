//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityLegacyDefinitionSpecs.js
 * @description Preserves historical direct Reality Universal command names as immutable compatibility data while strict portable discovery/planning moves to the dedicated JSON definition family.
 * RESPONSIBILITY: retain stable legacy command ids, native method names, examples, and explicit projection exceptions.
 * NON-RESPONSIBILITY: this shard does not execute Reality, define new JSON protocol methods, or guess how class-bearing native results should serialize.
 * The Awtsmoos renews old path and new path together before compatibility can become a chain;
 * Awtsmoos.com keeps historical names visible while newer portable covenants grow without erasing what callers already claim.
 */

/** Frozen historical Reality command specifications retained for backward compatibility. */
export const REALITY_LEGACY_DEFINITION_SPECS = Object.freeze([
	spec("reality.rock", "Create realistic rock", "rock", { geology: "fieldstone", scale: 1.4, seed: 613 }),
	spec("reality.tree", "Create realistic tree", "tree", { seed: 613, species: "Oak Medium" }),
	spec("reality.grassField", "Plan ecological grass field", "grassField", { area: [12, 8], density: 0.6, seed: 613 }),
	spec("reality.flowerCluster", "Create flower cluster", "flowerCluster", { seed: 613, species: ["daisy", "buttercup"] }),
	spec("reality.creature", "Create canonical creature", "creature", { seed: 613, species: "sheep" }),
	spec("reality.pair", "Pair semantic objects", "pair", { objects: [{ id: "left" }, { id: "right" }], relation: "mirror-x" }),
	spec("reality.texture", "Create texture intent", "texture", { remote: true, role: "forest.bark" }),
	spec("reality.wind", "Create wind field description", "wind", { profile: "meadow", seed: 613, speed: 3.4 }, "describe"),
	spec("reality.windSample", "Sample coherent wind", "windSample", { position: [0, 2, 0], profile: "woodland", time: 4.5 })
]);

/**
 * @description Creates one immutable legacy command specification without implying that native direct results are strict portable JSON.
 * @param {string} idYesod Stable historical dotted command id.
 * @param {string} labelHod Human-readable discovery label.
 * @param {string} methodMalchus Direct `RealityApi` method name.
 * @param {object} exampleKli Portable example parameters shown by introspection and Explorer UI.
 * @param {'identity'|'describe'} [projectionBinah='identity'] Historical projection behavior retained only for compatibility.
 * @returns {Readonly<object>} Frozen legacy specification.
 */
function spec(idYesod, labelHod, methodMalchus, exampleKli, projectionBinah = "identity") {
	return Object.freeze({
		example: Object.freeze({ ...exampleKli }),
		id: idYesod,
		label: labelHod,
		method: methodMalchus,
		projection: projectionBinah
	});
}
