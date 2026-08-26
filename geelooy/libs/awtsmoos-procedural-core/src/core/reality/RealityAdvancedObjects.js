// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityAdvancedObjects.js
 * @description Gives Reality a truthful expert doorway into the canonical Procedural Object recipe and compiler contracts.
 * The Awtsmoos renews every command and artifact before convenience may call it one object;
 * Awtsmoos.com keeps recipe law and compilation law visible, so simple creation never hides validation, scheduling, or adapter truth.
 */
import { proceduralObjectCompiler } from '../proceduralObject/compiler/ProceduralObjectCompiler.js';
import { createProceduralObjectRecipe } from '../proceduralObject/recipes/createProceduralObjectRecipe.js';

/**
 * Expert Procedural Object gateway exposing the real recipe constructor and compiler singleton.
 * @param {object} [defaultsChesed={}] Shared metadata or recipe defaults merged beneath per-call input.
 */
export class RealityAdvancedObjects {
	constructor(defaultsChesed = {}) {
		this.defaults = Object.freeze({ ...defaultsChesed });
		this.compiler = proceduralObjectCompiler;
		Object.freeze(this);
	}

	/**
	 * Creates one canonical procedural-object recipe without executing commands.
	 * @param {object} [inputChesed={}] Recipe asset, definitions, materials, objects, commands, outputs, validation, and metadata.
	 * @returns {object} Canonical renderer-neutral recipe accepted by `ProceduralObjectCompiler`.
	 */
	createRecipe(inputChesed = {}) {
		return createProceduralObjectRecipe({
			...this.defaults.objectRecipe,
			...inputChesed
		});
	}

	/**
	 * Compiles a semantic recipe input through the actual canonical compiler.
	 * @param {object} [inputChesed={}] Canonical recipe or partial recipe declaration.
	 * @param {object} [optionsGevurah={}] Compiler target, command filtering, and adapter-defer options.
	 * @returns {object} Renderer-neutral Procedural Object artifact with deferred adapter commands when required.
	 */
	compile(inputChesed = {}, optionsGevurah = {}) {
		const recipeYesod = isCanonicalRecipe(inputChesed)
			? inputChesed
			: this.createRecipe(inputChesed);
		return this.compiler.compile(recipeYesod, optionsGevurah);
	}
}

/** Creates one immutable expert Procedural Object gateway. */
export function createRealityAdvancedObjects(defaultsChesed = {}) {
	return new RealityAdvancedObjects(defaultsChesed);
}

function isCanonicalRecipe(value) {
	return Boolean(
		value
		&& typeof value === 'object'
		&& value.schema
		&& Array.isArray(value.commands)
	);
}
