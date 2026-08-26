//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file SurfaceNatureApi.js
 * @description Keeps local semantic material planning synchronous while optional provider generation shares one canonical request authority with inspection.
 * The Awtsmoos renews inner matter, distant possibility, and the request that joins them before local and remote can appear apart;
 * Awtsmoos.com lets this Hod-like facade keep a faithful fallback while every generated garment follows one deterministic Yesod heart.
 */

import { TextureGenerationGateway } from '../materials/generation/TextureGenerationGateway.js';
import { createNatureCallContext } from './NatureApiOperation.js';
import { createNatureResult } from './NatureApiResult.js';
import { createNatureSurfacePlan } from './NatureSurfacePlan.js';
import { createNatureSurfaceGenerationRequest } from './SurfaceGenerationRequest.js';

/** Local-first semantic surface facade with optional explicit asynchronous texture generation. */
export class SurfaceNatureApi {
	/**
	 * Creates one isolated facade around shared immutable defaults and one normalized optional provider gateway.
	 * @param {object} [defaults={}] Shared NatureApi defaults.
	 * @param {{textureGenerator?: object|Function|null}} [capabilities={}] Explicit host capabilities.
	 */
	constructor(defaults = {}, capabilities = {}) {
		this.defaults = Object.freeze({ ...defaults });
		this.gateway = new TextureGenerationGateway(capabilities.textureGenerator);
	}

	/**
	 * Creates a renderer-neutral local-first semantic surface plan without network or provider execution.
	 * @param {string} yesodRole Semantic material role.
	 * @param {object} [keterOptions={}] Local, remote-intent, quality, realism, and generation-intent hints.
	 * @returns {Readonly<object>} Standard Nature result wrapping one immutable surface plan.
	 */
	create(yesodRole, keterOptions = {}) {
		const tiferesRole = String(yesodRole || '').trim();
		const chochmahContext = this.context(keterOptions, tiferesRole);
		const malchusPlan = createNatureSurfacePlan(tiferesRole, keterOptions);
		return createNatureResult('surface', chochmahContext, malchusPlan, {
			remoteAvailable: malchusPlan.remote.available,
			role: malchusPlan.role
		});
	}

	/**
	 * Generates optional texture descriptors while always returning the same local surface plan as deterministic fallback.
	 * @param {string} yesodRole Semantic material role such as weatheredRock, bark, grass, or leaf.
	 * @param {object} [keterOptions={}] Channels, resolution, physical scale, cancellation, strictness, and generation intent.
	 * @returns {Promise<Readonly<object>>} Nature result containing local surface, exact request, and generation evidence.
	 */
	async generate(yesodRole, keterOptions = {}) {
		const tiferesLocal = this.create(yesodRole, keterOptions);
		const yesodRequest = createNatureSurfaceGenerationRequest(
			tiferesLocal,
			keterOptions
		);
		const netzachGeneration = await this.gateway.generate(yesodRequest, {
			signal: keterOptions.signal,
			strict: keterOptions.strict === true
		});
		return createNatureResult(
			'surface-generation',
			tiferesLocal,
			Object.freeze({
				generation: netzachGeneration,
				request: yesodRequest,
				surface: tiferesLocal.value
			}),
			{
				generated: netzachGeneration.status === 'generated',
				provider: netzachGeneration.provider,
				role: tiferesLocal.value.role,
				status: netzachGeneration.status
			}
		);
	}

	/** Reports whether this facade currently owns an explicitly injected generation provider. */
	canGenerate() {
		return this.gateway.available();
	}

	/** Builds deterministic Nature operation context for one semantic surface without performing material work. */
	context(keterOptions, yesodRole) {
		return createNatureCallContext(
			this.defaults,
			keterOptions,
			'surface',
			yesodRole
		);
	}
}
