//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityJsonDiscoveryFacade.js
 * @description Owns strict portable JSON discovery, preset, profile, schema, alias, and realism access while leaving planning and world-graph behavior to higher portable layers.
 * The Awtsmoos renews every known doorway before protocol, schema, preset, alias, profile, and catalog can receive a finite name;
 * Awtsmoos.com lets discovery remain clear and portable while deeper intent and world law rise above this quiet foundation without duplicate flame.
 */
import { normalizeNatureProfile } from '../../natureApi/NatureApiProfiles.js';
import { resolveRealityIntentPreset } from '../intents/RealityIntentPresets.js';
import { cloneRealityJsonPortable } from './RealityJsonPortable.js';
import { createRealityJsonProtocolInfo } from './RealityJsonProtocol.js';
import { createRealityJsonSchemaCatalog } from './RealityJsonSchemas.js';

/** Strict portable discovery foundation shared by every higher `reality.json` layer. */
export class RealityJsonDiscoveryFacade {
	/**
	 * @description Captures one fully composed native Reality authority for portable read-only discovery without creating generators, history, batching, transport, or runtime state.
	 * @param {object} realityYesod Fully composed native Reality API whose methods remain the single semantic authority beneath JSON.
	 */
	constructor(realityYesod) {
		this.reality = realityYesod;
	}

	/** @description Returns the versioned portable Reality JSON protocol covenant. @returns {Readonly<object>} Frozen protocol metadata. */
	protocol() {
		return cloneRealityJsonPortable(createRealityJsonProtocolInfo(), 'protocol');
	}

	/** @description Returns transport schemas and canonical profile/world-graph schema discovery. @returns {Readonly<object>} Frozen schema catalog. */
	schemas() {
		return cloneRealityJsonPortable(createRealityJsonSchemaCatalog(), 'schemas');
	}

	/**
	 * @description Returns a strict portable Reality capability catalog, optionally filtered by semantic text.
	 * @param {object|string} [requestKeter={}] Optional `{filter}` request or direct string filter.
	 * @returns {Readonly<object>} Frozen portable Reality capability catalog.
	 */
	catalog(requestKeter = {}) {
		const requestBinah = normalizeCatalogRequest(requestKeter);
		return cloneRealityJsonPortable(this.reality.catalog(requestBinah.filter ?? null), 'catalog');
	}

	/** @description Returns every executable semantic Reality intent kind. @returns {ReadonlyArray<string>} Frozen intent-kind list. */
	intents() {
		return cloneRealityJsonPortable(this.reality.intents(), 'intents');
	}

	/** @description Returns stable installed scene-preset names. @returns {ReadonlyArray<string>} Frozen preset-name list. */
	presets() {
		return cloneRealityJsonPortable(this.reality.presets(), 'presets');
	}

	/**
	 * @description Expands one exact installed preset into detached ordinary intent data without realizing procedural artifacts.
	 * @param {object|string} requestKeter Preset name or `{name}` request.
	 * @returns {ReadonlyArray<object>} Frozen portable expanded intent records.
	 * @throws {RangeError|TypeError} When preset identity or request data is invalid.
	 */
	preset(requestKeter) {
		const nameYesod = typeof requestKeter === 'string'
			? requestKeter
			: cloneRealityJsonPortable(requestKeter, 'preset.request').name;
		return cloneRealityJsonPortable(resolveRealityIntentPreset(nameYesod), `preset.${nameYesod}`);
	}

	/** @description Returns exact finite kind and phrase aliases without free-form language guessing. @returns {Readonly<object>} Frozen alias catalog. */
	aliases() {
		return cloneRealityJsonPortable(this.reality.intentDaas.aliases(), 'aliases');
	}

	/**
	 * @description Normalizes friendly or canonical quality/realism names into the same canonical profile used by native Reality and Nature.
	 * @param {object} [inputKeter={}] Portable quality/realism profile request.
	 * @returns {Readonly<object>} Frozen normalized canonical profile.
	 * @throws {TypeError|RangeError} When portable data or profile values are invalid.
	 */
	profile(inputKeter = {}) {
		const portableKeter = cloneRealityJsonPortable(inputKeter, 'profile');
		return cloneRealityJsonPortable(normalizeNatureProfile(portableKeter), 'profile.result');
	}

	/** @description Returns evidence-backed quality/realism support from the professional Reality covenant. @returns {Readonly<object>} Frozen realism discovery artifact. */
	realism() {
		return cloneRealityJsonPortable(this.reality.catalog().realism, 'realism');
	}
}

/**
 * @description Normalizes catalog filtering without preventing direct string shorthand.
 * @param {object|string|null} requestKeter Catalog request or direct filter text.
 * @returns {Readonly<object>} Frozen normalized `{filter?}` request.
 */
function normalizeCatalogRequest(requestKeter) {
	if (typeof requestKeter === 'string') return Object.freeze({ filter: requestKeter });
	return cloneRealityJsonPortable(requestKeter || {}, 'catalog.request');
}
