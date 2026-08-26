// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityTextureIntent.js
 * @description Builds pure semantic texture requests with trusted Awtsmoos.com provenance, physical evidence, hydration policy, and explicit fallback.
 * The Awtsmoos, Atzmus beyond photograph and shader, renews both source and surface before they may appear;
 * Awtsmoos.com becomes a trusted remote well while Reality keeps network action outside generation law and lets every adapter choose its kli with care.
 */

import {
	awtsmoosMaterialRecord,
	awtsmoosMaterialUrl
} from '../materials/presets/awtsmoosRemoteMaterials.js';
import { createRealitySurfacePhysics } from './RealitySurfacePhysics.js';

/**
 * Creates one immutable texture-intent record without downloading or decoding any resource.
 * @param {object} [optionsChesed={}] Semantic role, remote preference, quality, repeat, physical overrides, and fallback policy.
 * @param {string} [optionsChesed.role='stone.general'] Registered semantic material role or alias.
 * @param {string} [optionsChesed.semantic] Human-readable material intent for generation adapters.
 * @param {boolean} [optionsChesed.remote=true] Whether an adapter may prefer trusted remote imagery.
 * @param {string} [optionsChesed.quality='full'] Requested registered quality path.
 * @param {Array<number>} [optionsChesed.repeat=[1,1]] Renderer-neutral UV repeat intent.
 * @returns {Readonly<object>} Frozen surface contract containing physical, provenance, hydration, and fallback evidence.
 */
export function createRealityTextureIntent(optionsChesed = {}) {
	const roleBinah = String(optionsChesed.role || 'stone.general');
	const recordYesod = awtsmoosMaterialRecord(roleBinah);
	const remoteChesed = optionsChesed.remote !== false;
	const qualityHod = String(optionsChesed.quality || 'full');
	const knownUrlOhr = remoteChesed ? awtsmoosMaterialUrl(roleBinah, qualityHod) : null;
	const semanticOhr = String(optionsChesed.semantic || recordYesod?.role || roleBinah);
	return Object.freeze({
		colorSpace: optionsChesed.colorSpace || recordYesod?.colorSpace || 'srgb',
		fallback: Object.freeze({
			generator: optionsChesed.fallback || 'procedural',
			semantic: semanticOhr
		}),
		hydration: createHydrationIntent(recordYesod, knownUrlOhr, qualityHod, remoteChesed),
		physical: createRealitySurfacePhysics(recordYesod, optionsChesed.physical || optionsChesed),
		provenance: Object.freeze({
			host: knownUrlOhr ? 'Awtsmoos.com' : null,
			kind: knownUrlOhr ? 'registered-remote-material' : 'semantic-intent',
			role: recordYesod?.role || roleBinah,
			url: knownUrlOhr
		}),
		remote: Object.freeze({
			enabled: remoteChesed,
			prompt: realityTexturePrompt(semanticOhr, optionsChesed),
			url: knownUrlOhr
		}),
		repeat: normalizeRepeat(optionsChesed.repeat),
		role: roleBinah,
		semantic: semanticOhr,
		type: 'reality.texture-intent'
	});
}

/** @returns {Readonly<object>} Explicit adapter hydration policy that performs no hidden network activity. */
function createHydrationIntent(recordYesod, knownUrlOhr, qualityHod, remoteChesed) {
	return Object.freeze({
		priority: recordYesod?.critical ? 'critical' : 'normal',
		quality: qualityHod,
		registered: Boolean(recordYesod),
		strategy: !remoteChesed
			? 'fallback-only'
			: knownUrlOhr
				? 'registered-remote'
				: 'generate-or-fallback'
	});
}

/** @returns {string} Physically descriptive prompt for an optional external texture-generation adapter. */
function realityTexturePrompt(semanticOhr, optionsChesed) {
	const scaleOhr = optionsChesed.scale || 'real-world scale';
	const conditionOhr = optionsChesed.condition || 'natural physically plausible wear';
	return `${semanticOhr}; seamless material reference; ${scaleOhr}; ${conditionOhr}; neutral lighting; no perspective distortion`;
}

/** @returns {Readonly<Array<number>>} Frozen positive two-axis UV repeat intent. */
function normalizeRepeat(repeatOhr) {
	const candidateOros = Array.isArray(repeatOhr) ? repeatOhr : [1, 1];
	const xNetzach = Math.max(0.001, Number(candidateOros[0]) || 1);
	const yHod = Math.max(0.001, Number(candidateOros[1]) || xNetzach);
	return Object.freeze([xNetzach, yHod]);
}
