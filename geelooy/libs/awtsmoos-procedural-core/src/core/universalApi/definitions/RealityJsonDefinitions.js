//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityJsonDefinitions.js
 * @description Adapts the complete strict `reality.json` command catalog—including World Graph operations—into Universal read-only definitions while reusing existing registry, executor, batching, history, dry-run, and introspection machinery.
 * RESPONSIBILITY: translate immutable JSON command specs into portable Universal method definitions bound to one live Reality JSON façade.
 * NON-RESPONSIBILITY: this vessel creates no second executor, projection heuristic, transport, transaction engine, world-graph engine, or native-runtime serializer.
 * The Awtsmoos renews one portable covenant before Universal and Reality can appear as neighboring gates;
 * Awtsmoos.com lets discovery, intent, and world-document commands share one executor and one JSON truth, so orchestration grows without duplicating fate.
 */
import { listRealityJsonDefinitionSpecs } from './RealityJsonDefinitionCatalog.js';

/** Adapter that binds one immutable JSON command specification to one live Reality JSON façade. */
class RealityJsonDefinitionAdapter {
	/**
	 * @description Captures one Reality instance and one immutable definition spec without mutating either input, validating that the declared strict JSON method exists before registration.
	 * @param {object} realityTiferes Fully composed Reality API exposing the final strict `json` namespace.
	 * @param {Readonly<object>} specBinah Portable command specification from the composed Reality JSON definition catalog.
	 * @throws {TypeError} When the supplied Reality API does not expose the expected JSON method.
	 */
	constructor(realityTiferes, specBinah) {
		if (typeof realityTiferes?.json?.[specBinah.method] !== 'function') {
			throw new TypeError(`B"H | Reality JSON method "${specBinah.method}" is unavailable.`);
		}
		this.reality = realityTiferes;
		this.spec = specBinah;
	}

	/**
	 * @description Creates one Universal method definition whose public metadata is fully portable and whose execution delegates directly to the strict `reality.json` method declared by the spec.
	 * @returns {object} Universal definition consumed by `MethodRegistry`, API introspection, Explorer UI, and the existing executor.
	 */
	create() {
		return {
			cost: this.spec.cost,
			description: `${this.spec.label} through the strict portable Reality JSON covenant.`,
			examples: [this.spec.example],
			execute: this.execute.bind(this),
			id: this.spec.id,
			jsonProjection: 'portable',
			label: this.spec.label,
			mutates: false,
			namespace: 'reality',
			nativeResultKind: 'portable-json',
			paramsSchema: this.spec.paramsSchema,
			permissions: ['world.read'],
			resultSchema: this.spec.resultSchema,
			runtimeName: this.spec.method,
			sideEffects: [],
			stability: 'stable',
			surfaceKind: 'method',
			transaction: 'read-only',
			ui: { control: 'form', expert: false, panel: 'Reality JSON' },
			undo: false
		};
	}

	/**
	 * @description Executes one portable Universal command by invoking its exact strict Reality JSON method; no native artifact projection or alternate world-graph behavior occurs here.
	 * @param {object} _contextKli Universal execution context, intentionally unused because Reality JSON discovery/planning/world-document operations are read-only and self-contained.
	 * @param {object} [paramsKli={}] Already transport-validated portable method parameters.
	 * @returns {unknown} Strict JSON-compatible value returned by the canonical `reality.json` façade.
	 * @throws {Error} Propagates semantic graph, validation, profile, preset, query, edit, or planning errors for Universal's standard result-envelope handling.
	 */
	execute(_contextKli, paramsKli = {}) {
		return this.reality.json[this.spec.method](paramsKli);
	}
}

/**
 * @description Generates the complete portable Reality JSON definition family around one reusable live Reality instance, including discovery, intent, and World Graph operations.
 * @param {object} realityTiferes Fully composed Reality API whose `json` namespace owns canonical portable behavior.
 * @returns {Array<object>} Universal method definitions ready for the existing `MethodRegistry`.
 * @throws {TypeError} Propagates adapter validation when any declared JSON method is missing from the live Reality surface.
 */
export function createRealityJsonDefinitions(realityTiferes) {
	return listRealityJsonDefinitionSpecs().map((specBinah) => {
		return new RealityJsonDefinitionAdapter(realityTiferes, specBinah).create();
	});
}
