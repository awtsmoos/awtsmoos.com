//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityJsonFacade.js
 * @description Exposes Reality planning, validation, profiles, aliases, presets, schemas, realism, and discovery through a strict portable JSON-only namespace.
 * The Awtsmoos renews one Reality before native life and portable description can seem like separate sources;
 * Awtsmoos.com lets JSON carry exact intent and covenant while living meshes, runtimes, functions, and classes remain honestly native on their courses.
 */
import { normalizeNatureProfile } from '../../natureApi/NatureApiProfiles.js';
import { resolveRealityIntentPreset } from '../intents/RealityIntentPresets.js';
import { cloneRealityJsonPortable } from './RealityJsonPortable.js';
import { createRealityJsonProtocolInfo } from './RealityJsonProtocol.js';
import { createRealityJsonSchemaCatalog } from './RealityJsonSchemas.js';
import { createRealityJsonValidationReport } from './RealityJsonValidation.js';

/** Strict portable Reality JSON namespace sharing the canonical native planner and capability covenant. */
export class RealityJsonFacade {
	/**
	 * Creates one JSON namespace above a live RealityApi without owning generators, history, batching, transport, or runtime state.
	 * @param {object} realityYesod Fully composed native Reality API.
	 */
	constructor(realityYesod) {
		this.reality = realityYesod;
		Object.freeze(this);
	}

	/** Returns the versioned portable Reality JSON protocol covenant. */
	protocol() {
		return cloneRealityJsonPortable(createRealityJsonProtocolInfo(), 'protocol');
	}

	/** Returns transport schemas and canonical profile enum discovery. */
	schemas() {
		return cloneRealityJsonPortable(createRealityJsonSchemaCatalog(), 'schemas');
	}

	/** Returns a strict portable Reality catalog, optionally filtered by semantic text. */
	catalog(requestKeter = {}) {
		const requestBinah = normalizeCatalogRequest(requestKeter);
		return cloneRealityJsonPortable(
			this.reality.catalog(requestBinah.filter ?? null),
			'catalog'
		);
	}

	/** Returns every currently executable semantic Reality intent kind. */
	intents() {
		return cloneRealityJsonPortable(this.reality.intents(), 'intents');
	}

	/** Returns stable installed scene-preset names. */
	presets() {
		return cloneRealityJsonPortable(this.reality.presets(), 'presets');
	}

	/** Expands one exact named preset into detached ordinary intent data. */
	preset(requestKeter) {
		const nameYesod = typeof requestKeter === 'string'
			? requestKeter
			: cloneRealityJsonPortable(requestKeter, 'preset.request').name;
		return cloneRealityJsonPortable(resolveRealityIntentPreset(nameYesod), `preset.${nameYesod}`);
	}

	/** Returns exact finite kind and phrase aliases without natural-language guessing. */
	aliases() {
		return cloneRealityJsonPortable(this.reality.intentDaas.aliases(), 'aliases');
	}

	/** Normalizes friendly or canonical quality/realism names into canonical profile values. */
	profile(inputKeter = {}) {
		const portableKeter = cloneRealityJsonPortable(inputKeter, 'profile');
		return cloneRealityJsonPortable(normalizeNatureProfile(portableKeter), 'profile.result');
	}

	/** Returns evidence-backed realism/quality capability support from the professional Reality covenant. */
	realism() {
		return cloneRealityJsonPortable(this.reality.catalog().realism, 'realism');
	}

	/** Produces the exact canonical non-heavy plan used by native JavaScript callers. */
	plan(requestKeter) {
		const requestBinah = normalizeIntentRequest(requestKeter);
		return cloneRealityJsonPortable(
			this.reality.plan(requestBinah.intent, requestBinah.defaults || {}),
			'plan'
		);
	}

	/** Explains intent through the same canonical non-heavy planner and returns strict portable evidence. */
	explain(requestKeter) {
		const requestBinah = normalizeIntentRequest(requestKeter);
		return cloneRealityJsonPortable(
			this.reality.explain(requestBinah.intent, requestBinah.defaults || {}),
			'explain'
		);
	}

	/** Validates JSON portability plus the complete canonical Reality semantic graph without generation. */
	validate(requestKeter) {
		return createRealityJsonValidationReport(() => this.plan(requestKeter));
	}
}

function normalizeIntentRequest(requestKeter) {
	const requestBinah = cloneRealityJsonPortable(requestKeter, 'intent.request');
	if (!requestBinah || typeof requestBinah !== 'object' || Array.isArray(requestBinah)) {
		throw new TypeError('B"H | Reality JSON intent request must be an object.');
	}
	if (!Object.hasOwn(requestBinah, 'intent')) {
		throw new TypeError('B"H | Reality JSON intent request requires `intent`.');
	}
	return requestBinah;
}

function normalizeCatalogRequest(requestKeter) {
	if (typeof requestKeter === 'string') return Object.freeze({ filter: requestKeter });
	return cloneRealityJsonPortable(requestKeter || {}, 'catalog.request');
}
