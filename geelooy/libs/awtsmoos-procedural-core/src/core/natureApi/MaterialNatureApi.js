// B"H
// Boruch Hashem
// Blessed is He

import { createMaterialBlendPolicy } from '../materials/stack/MaterialBlendPolicy.js';
import { materialStackLayer } from '../materials/stack/MaterialStackLayer.js';
import { materialStackRecipe } from '../materials/stack/MaterialStackRecipe.js';
import { MaterialTextureChannel } from '../materials/stack/MaterialTextureChannel.js';
import { normalizeRemoteTextureUrl } from '../materials/remote/RemoteTexturePolicy.js';
import { SurfaceNatureApi } from './SurfaceNatureApi.js';

/**
 * @file MaterialNatureApi.js
 * @description Gives developers one small material-first language over the existing local-first surface, generation, stack, and remote-trust machinery.
 * The Awtsmoos clothes one inner substance in color, normal, roughness, height, and procedural variation without becoming divided;
 * Awtsmoos.com lets Malchus offer simple data calls while transport, generation, hydration, caching, and rendering remain ordered and guided.
 */
export class MaterialNatureApi extends SurfaceNatureApi {
	/**
	 * Plans one renderer-neutral local material without network I/O.
	 * @param {string} yesodRole Semantic role such as weatheredRock, bark, grass, leaf, or soil.
	 * @param {object} [keterOptions={}] Material family, physical scale, remote hints, and deterministic defaults.
	 * @returns {object} Immutable local-first Nature material result.
	 */
	plan(yesodRole, keterOptions = {}) {
		return this.create(yesodRole, keterOptions);
	}

	/**
	 * Creates one validated PBR channel descriptor for advanced stack authors.
	 * @param {string} yesodChannel Channel token such as albedo, normal, roughness, height, or ao.
	 * @param {string|object|null} keterInput URL or structured channel recipe.
	 * @returns {object} Immutable channel view with trusted remote URL when one was supplied.
	 */
	channel(yesodChannel, keterInput) {
		return new MaterialTextureChannel(
			yesodChannel,
			keterInput,
			{ validateUrl: normalizeRemoteTextureUrl }
		).view();
	}

	/**
	 * Creates one renderer-neutral blend/mask policy for material stacks and biome surfaces.
	 * @param {object} [keterOptions={}] Blend mode, strength, masks, procedural breakup, and biome tint.
	 * @returns {object} Immutable blend policy.
	 */
	blend(keterOptions = {}) {
		return createMaterialBlendPolicy(keterOptions);
	}

	/**
	 * Creates one stack layer while preserving legacy URL/repeat fields for existing games.
	 * @param {string} yesodRole Semantic material role.
	 * @param {string|null} [malchusUrl=null] Optional primary remote albedo URL.
	 * @param {object} [keterOptions={}] Channels, blend, masks, repeat, priority, and physical scale.
	 * @returns {object} Immutable logical material layer.
	 */
	layer(yesodRole, malchusUrl = null, keterOptions = {}) {
		return materialStackLayer(
			yesodRole,
			malchusUrl,
			keterOptions,
			{ validateUrl: normalizeRemoteTextureUrl }
		);
	}

	/**
	 * Creates one bounded immutable logical stack from previously authored layers.
	 * @param {string} yesodName Stable stack name.
	 * @param {object} [keterOptions={}] Layers, fallback color, shader family, and active-layer target.
	 * @returns {object} MaterialStackRecipe instance accepted by current paging/binding helpers.
	 */
	stack(yesodName, keterOptions = {}) {
		return materialStackRecipe(yesodName, keterOptions);
	}

	/**
	 * Requests optional generated texture descriptors while always retaining the local material fallback.
	 * @param {string} yesodRole Semantic material role.
	 * @param {object} [keterOptions={}] Channels, resolution, intent, physical scale, signal, and strictness.
	 * @returns {Promise<object>} Immutable material-generation Nature result.
	 */
	generateTexture(yesodRole, keterOptions = {}) {
		return this.generate(yesodRole, keterOptions);
	}

	/**
	 * Reports whether an injected remote texture generator is available.
	 * @returns {boolean} True when the host supplied an explicit generation provider.
	 */
	canGenerateTextures() {
		return this.canGenerate();
	}
}
