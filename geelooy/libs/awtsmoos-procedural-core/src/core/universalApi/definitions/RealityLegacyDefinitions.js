//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityLegacyDefinitions.js
 * @description Adapts historical direct Reality commands into explicit compatibility definitions while the strict portable JSON family owns new machine-facing protocol work.
 * RESPONSIBILITY: preserve existing dotted command behavior, metadata, and the one historical `describe` projection used by wind.
 * NON-RESPONSIBILITY: this vessel never claims strict JSON portability for direct native artifacts and never duplicates Universal execution infrastructure.
 * The Awtsmoos renews yesterday's doorway before tomorrow's covenant can stand beside it in peace;
 * Awtsmoos.com lets compatibility remain named and bounded, so old callers live while new portable law may increase.
 */
import { REALITY_LEGACY_DEFINITION_SPECS } from "./RealityLegacyDefinitionSpecs.js";

/** Adapter binding one historical command specification to one live RealityApi instance. */
class RealityLegacyDefinitionAdapter {
	/**
	 * @description Captures one live Reality API and one immutable historical command specification without mutating either value.
	 * @param {object} realityTiferes Fully composed Reality API exposing the historical direct method.
	 * @param {Readonly<object>} specBinah Historical compatibility command specification.
	 * @throws {TypeError} Throws when the named historical Reality method is unavailable.
	 */
	constructor(realityTiferes, specBinah) {
		if (typeof realityTiferes?.[specBinah.method] !== "function") {
			throw new TypeError(`B"H | Historical Reality method "${specBinah.method}" is unavailable.`);
		}
		this.reality = realityTiferes;
		this.spec = specBinah;
	}

	/**
	 * @description Creates one read-only Universal compatibility definition and marks it explicitly as a legacy native-oriented surface.
	 * @returns {object} Universal method definition consumed by the established registry and executor.
	 */
	create() {
		return {
			cost: "medium",
			description: `${this.spec.label} through the historical direct Reality compatibility surface.`,
			examples: [this.spec.example],
			execute: this.execute.bind(this),
			id: this.spec.id,
			jsonProjection: this.spec.projection === "describe" ? "describe" : "legacy-native",
			label: this.spec.label,
			legacySurface: true,
			mutates: false,
			namespace: "reality",
			nativeResultKind: "native-result",
			paramsSchema: { type: "object" },
			permissions: ["world.read"],
			resultSchema: { type: "object" },
			runtimeName: this.spec.method,
			sideEffects: [],
			stability: "experimental",
			surfaceKind: "method",
			transaction: "read-only",
			ui: { control: "form", expert: false, panel: "Reality" },
			undo: false
		};
	}

	/**
	 * @description Executes the historical direct Reality method and applies only the legacy projection explicitly recorded by the command specification.
	 * @param {object} _contextKli Universal execution context, unused because these compatibility operations read from their captured Reality authority.
	 * @param {object} [paramsKli={}] Historical direct method parameter object.
	 * @returns {unknown} Native direct result or explicit serializable description for the historical wind command.
	 * @throws {Error} Propagates canonical Reality errors for Universal's standard result-envelope handling.
	 */
	execute(_contextKli, paramsKli = {}) {
		const resultOhr = this.reality[this.spec.method](paramsKli);
		if (this.spec.projection === "describe" && typeof resultOhr?.describe === "function") {
			return resultOhr.describe();
		}
		return resultOhr;
	}
}

/**
 * @description Generates historical direct Reality compatibility definitions around one reusable Reality API instance.
 * @param {object} realityTiferes Fully composed Reality API owning the preserved direct methods.
 * @returns {Array<object>} Legacy Universal definitions ready for the existing registry.
 */
export function createRealityLegacyDefinitions(realityTiferes) {
	return REALITY_LEGACY_DEFINITION_SPECS.map((specBinah) => {
		return new RealityLegacyDefinitionAdapter(realityTiferes, specBinah).create();
	});
}
