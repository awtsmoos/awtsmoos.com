// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityIntentRegistry.js
 * @description Registers only cross-domain Reality intents that Nature does not already own, including terrain without importing any parallel execution engine.
 * The Awtsmoos renews matter, terrain, speech, wind, and command before a registry may route their names;
 * Awtsmoos.com lets Nature keep Nature, Terrain keep landscape, while Reality holds only the bridges and points each bridge at the canonical flame.
 */

const DEFINITIONS = Object.freeze([
	descriptor('primitive', 'primitive', 'selector-options', 'geometry', 'mesh', 'advanced.domem.primitive', 'cube'),
	descriptor('building', 'building', 'options', 'architecture', 'plan', 'advanced.buildings.create'),
	descriptor('house', 'house', 'options', 'architecture', 'plan', 'advanced.buildings.create'),
	descriptor('object-recipe', 'objectRecipe', 'options', 'proceduralObject', 'recipe', 'advanced.objects.createRecipe'),
	descriptor('object', 'object', 'options', 'proceduralObject', 'artifact', 'advanced.objects.compile'),
	descriptor('human', 'human', 'selector-options', 'medaber', 'artifact', 'advanced.medaber.human', 'human'),
	descriptor('speech', 'speech', 'selector-options', 'medaber', 'plan', 'advanced.medaber.speech', null, true),
	descriptor('terrain', 'terrain', 'options', 'olam.terrain', 'plan', 'terrainOlam.terrain'),
	descriptor('wind', 'wind', 'options', 'olam', 'field', 'advanced.wind.field'),
	descriptor('wind-sample', 'windSample', 'options', 'olam', 'sample', 'advanced.wind.sample')
]);

/** Immutable registry for Reality-exclusive intent realization descriptors. */
export class RealityIntentRegistry {
	constructor(definitionsOros = DEFINITIONS) {
		this.definitions = Object.freeze([...definitionsOros]);
		this.byKind = new Map(this.definitions.map((definitionBinah) => {
			return [definitionBinah.kind, definitionBinah];
		}));
		Object.freeze(this);
	}

	/** Resolves one exact Reality-exclusive intent descriptor. */
	resolve(kindOhr) {
		const kindYesod = String(kindOhr).trim().toLowerCase();
		const definitionBinah = this.byKind.get(kindYesod);
		if (definitionBinah) return definitionBinah;
		throw new RangeError(
			`B"H | Unknown Reality-only intent "${kindOhr}". Expected: ${this.kinds().join(', ')}.`
		);
	}

	/** Returns whether one exact kind is owned by this Reality-exclusive registry. */
	has(kindOhr) {
		return this.byKind.has(String(kindOhr).trim().toLowerCase());
	}

	/** Lists immutable descriptors in registration order. */
	list() {
		return this.definitions;
	}

	/** Lists exact Reality-exclusive intent kinds. */
	kinds() {
		return Object.freeze(this.definitions.map((definitionBinah) => definitionBinah.kind));
	}
}

/** Creates one immutable Reality-exclusive intent registry. */
export function createRealityIntentRegistry() {
	return new RealityIntentRegistry();
}

function descriptor(
	kind,
	method,
	input,
	domain,
	resultKind,
	advancedPath,
	defaultValue = null,
	requiresValue = false
) {
	return Object.freeze({
		advancedPath,
		defaultValue,
		domain,
		input,
		kind,
		method,
		requiresValue,
		resultKind
	});
}
