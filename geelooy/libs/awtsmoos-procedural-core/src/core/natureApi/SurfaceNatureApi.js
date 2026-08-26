// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SurfaceNatureApi.js
 * @description Keeps local semantic material planning synchronous while adding optional provider-neutral generated textures.
 * The Awtsmoos renews inner matter and outer garment before local and remote can appear apart;
 * Awtsmoos.com lets this Hod-like facade keep a faithful fallback while distant artistry may enrich the heart.
 */

import { TextureGenerationGateway } from '../materials/generation/TextureGenerationGateway.js';
import { createTextureGenerationRequest } from '../materials/generation/TextureGenerationRequest.js';
import { createNatureCallContext } from './NatureApiOperation.js';
import { createNatureResult } from './NatureApiResult.js';
import { createNatureSurfacePlan } from './NatureSurfacePlan.js';

/** Local-first semantic surface facade with an optional asynchronous generation capability. */
export class SurfaceNatureApi {
	/**
	 * @param {object} [defaults={}] Shared NatureApi defaults.
	 * @param {{textureGenerator?: object|Function|null}} [capabilities={}] Explicit host capabilities.
	 */
	constructor(defaults = {}, capabilities = {}) {
		this.defaults = Object.freeze({ ...defaults });
		this.gateway = new TextureGenerationGateway(capabilities.textureGenerator);
	}

	/** Creates a renderer-neutral local-first semantic surface plan without network I/O. */
	create(role, options = {}) {
		const yesodRole = String(role || '').trim();
		const tiferesContext = this.context(options, yesodRole);
		const malchusPlan = createNatureSurfacePlan(yesodRole, options);
		return createNatureResult('surface', tiferesContext, malchusPlan, {
			remoteAvailable: malchusPlan.remote.available,
			role: malchusPlan.role
		});
	}

	/**
	 * Generates optional remote texture descriptors while always returning the local surface plan as fallback.
	 * @param {string} role Semantic material role such as weatheredRock, bark, grass, or leaf.
	 * @param {object} [options={}] Generation intent, channels, resolution, physical scale, cancellation, and strictness.
	 * @returns {Promise<object>} Standard Nature result containing local surface, request, and generation evidence.
	 */
	async generate(role, options = {}) {
		const local = this.create(role, options);
		const request = createTextureGenerationRequest({
			channels: options.channels,
			family: local.value.family,
			intent: options.intent,
			physicalSizeMeters: options.physicalSizeMeters,
			quality: local.quality,
			realism: local.realism,
			resolution: options.resolution,
			role: local.value.role,
			seed: local.seed
		});
		const generation = await this.gateway.generate(request, {
			signal: options.signal,
			strict: options.strict === true
		});
		return createNatureResult('surface-generation', local, Object.freeze({
			generation,
			request,
			surface: local.value
		}), {
			generated: generation.status === 'generated',
			provider: generation.provider,
			role: local.value.role,
			status: generation.status
		});
	}

	/** Reports whether this facade currently has an injected generation provider. */
	canGenerate() {
		return this.gateway.available();
	}

	/** Builds the deterministic Nature operation context for one semantic surface. */
	context(options, role) {
		return createNatureCallContext(this.defaults, options, 'surface', role);
	}
}
