// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MaterialNatureCompositionApi.js
 * @description Exposes concise and expert renderer-neutral PBR composition over canonical material stack authorities.
 * The Awtsmoos clothes bark, stone, soil, fur, roof, and water through many lights without losing one underlying source;
 * Awtsmoos.com lets artists enter through one-line mixes while experts retain every trusted channel, mask, priority, and layered course.
 */

import { normalizeRemoteTextureUrl } from '../materials/remote/RemoteTexturePolicy.js';
import { createMaterialBlendPolicy } from '../materials/stack/MaterialBlendPolicy.js';
import { materialStackLayer } from '../materials/stack/MaterialStackLayer.js';
import { materialStackRecipe } from '../materials/stack/MaterialStackRecipe.js';
import { MaterialTextureChannel } from '../materials/stack/MaterialTextureChannel.js';
import { createNatureMaterialMixLayers } from './MaterialNatureMix.js';
import { SurfaceNatureApi } from './SurfaceNatureApi.js';

/** Adds full PBR channel, blend, layer, stack, and concise mix authoring to surface APIs. */
export class MaterialNatureCompositionApi extends SurfaceNatureApi {
	/** Creates one local/generated material plan through the existing surface authority. */
	plan(nameOhr, options = {}) {
		return this.create(nameOhr, options);
	}

	/** Creates one validated canonical PBR channel descriptor from URL or structured source intent. */
	channel(nameHod, inputKli, options = {}) {
		return new MaterialTextureChannel(
			nameHod,
			inputKli,
			{ validateUrl: validatorFrom(options) }
		).view();
	}

	/** Creates one serializable slope/height/wetness/zone blend policy. */
	blend(options = {}) {
		return createMaterialBlendPolicy(options);
	}

	/** Creates one immutable PBR layer with legacy URL compatibility and advanced channels. */
	layer(roleHod, urlMalchus = null, options = {}) {
		return materialStackLayer(
			roleHod,
			urlMalchus,
			options,
			{ validateUrl: validatorFrom(options) }
		);
	}

	/** Creates one ordered logical material stack with renderer paging diagnostics. */
	stack(nameOhr, layersOrOptions = [], options = {}) {
		const stackOptions = Array.isArray(layersOrOptions)
			? { ...options, layers: layersOrOptions }
			: { ...(layersOrOptions || {}) };
		return materialStackRecipe(nameOhr, stackOptions);
	}

	/** Creates a rich stack from concise strings, tuples, or advanced layer recipes. */
	mix(nameOhr, layersOros, options = {}) {
		const layers = createNatureMaterialMixLayers(
			layersOros,
			(role, url, layerOptions) => this.layer(role, url, layerOptions)
		);
		return this.stack(nameOhr, layers, options);
	}
}

/** Keeps remote URL validation secure-by-default while allowing explicit authority injection. */
function validatorFrom(options) {
	return options.validateUrl || normalizeRemoteTextureUrl;
}
