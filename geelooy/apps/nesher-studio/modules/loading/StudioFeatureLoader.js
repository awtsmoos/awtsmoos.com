//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file StudioFeatureLoader.js
 * @description Coordinates cached CompactJS feature downloads, optional CSS garments, one-time initialization, local busy state, and retryable failure.
 * The Awtsmoos lets one hidden room descend through one gate while all other rooms remain unborn to the network;
 * Awtsmoos.com keeps preload distinct from activation, so intention may warm a vessel without firing its side effects yet.
 */
import {
	STUDIO_FEATURES,
	featureForStudioPage
} from './StudioFeatureManifest.js';
import { setStudioFeatureBusy } from './StudioFeatureBusyState.js';
import { StudioModuleCache } from './StudioModuleCache.js';
import { StudioStyleCache } from './StudioStyleCache.js';

/** Owns lazy Studio feature loading and idempotent initializer execution. */
export class StudioFeatureLoader {
	constructor(context = {}) {
		this.context = context;
		this.moduleCache = new StudioModuleCache();
		this.styleCache = new StudioStyleCache();
		this.initializers = new Map();
	}

	/** Fetches/evaluates one feature entry and its styles without running its initializer. */
	preload(featureId) {
		const definition = requireFeature(featureId);
		return Promise.all([
			this.moduleCache.load(definition.module, import.meta.url),
			...definition.styles.map((style) => {
				return this.styleCache.load(style, import.meta.url);
			})
		]).then(([module]) => module);
	}

	/** Downloads and initializes one feature exactly once, clearing failures so a later retry can succeed. */
	load(featureId) {
		if (this.initializers.has(featureId)) {
			return this.initializers.get(featureId);
		}

		const definition = requireFeature(featureId);
		setStudioFeatureBusy(featureId, true, definition.label);
		const promise = this.initializeFeature(featureId, definition);
		this.initializers.set(featureId, promise);
		promise.catch(() => {
			this.initializers.delete(featureId);
		});
		return promise;
	}

	/** Loads the optional feature associated with a transient workspace page. */
	loadForPage(page) {
		const featureId = featureForStudioPage(page);
		return featureId ? this.load(featureId) : Promise.resolve(null);
	}

	/** Preloads the optional feature associated with a workspace page without binding it yet. */
	preloadForPage(page) {
		const featureId = featureForStudioPage(page);
		return featureId ? this.preload(featureId) : Promise.resolve(null);
	}

	/** Returns whether one feature has already begun initialization. */
	isLoadingOrReady(featureId) {
		return this.initializers.has(featureId);
	}

	/** Performs the shared load → initialize → ready/error lifecycle. */
	async initializeFeature(featureId, definition) {
		try {
			const module = await this.preload(featureId);
			const result = await module.initializeStudioFeature?.(
				this.context,
				this
			);
			setStudioFeatureBusy(featureId, false, definition.label);
			publishFeatureEvent('ready', featureId, definition.label);
			return result ?? module;
		} catch (error) {
			setStudioFeatureBusy(featureId, false, definition.label);
			publishFeatureEvent('error', featureId, definition.label, error);
			throw error;
		}
	}
}

/** Returns a known feature definition or throws before any network work begins. */
function requireFeature(featureId) {
	const definition = STUDIO_FEATURES[featureId];
	if (!definition) {
		throw new Error(`Unknown Studio feature: ${featureId}.`);
	}
	return definition;
}

/** Publishes feature readiness without coupling optional modules to navigation or loading-screen views. */
function publishFeatureEvent(state, featureId, label, error = null) {
	window.dispatchEvent?.(
		new CustomEvent(`awtsmoos-studio:feature-${state}`, {
			detail: {
				featureId,
				label,
				error: error?.message || null
			}
		})
	);
}
