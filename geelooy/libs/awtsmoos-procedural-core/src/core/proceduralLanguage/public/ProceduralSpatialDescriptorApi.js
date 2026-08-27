//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralSpatialDescriptorApi.js
 * @description Collects renderer-neutral references, frames, guides, fields, surfaces, volumes, constraints, distributions, and resources behind one discoverable JS garment.
 * The Awtsmoos precedes point, path, surface, volume, field, and relation before their finite names appear;
 * Awtsmoos.com lets every domain share these spatial vessels while direct JSON authors use the exact same flame.
 */

import { createConstraintDescriptor } from '../descriptor/createConstraintDescriptor.js';
import { createDistributionDescriptor } from '../descriptor/createDistributionDescriptor.js';
import { createFieldDescriptor } from '../descriptor/createFieldDescriptor.js';
import { createFrameDescriptor } from '../descriptor/createFrameDescriptor.js';
import { createGuideDescriptor } from '../descriptor/createGuideDescriptor.js';
import { createResourceDescriptor } from '../descriptor/createResourceDescriptor.js';
import { createSurfaceDescriptor } from '../descriptor/createSurfaceDescriptor.js';
import { createVolumeDescriptor } from '../descriptor/createVolumeDescriptor.js';
import { createSemanticReference } from '../reference/createSemanticReference.js';

/**
 * Authoring facade for portable spatial and semantic descriptor contracts.
 * @class
 */
export class ProceduralSpatialDescriptorApi {
	/** Creates a generic namespaced semantic reference. */
	ref(input, options = {}) {
		return createSemanticReference(input, options);
	}

	/** Creates a local coordinate frame for attachment, rigging, architecture, or mesh work. */
	frame(input = {}) {
		return createFrameDescriptor(input);
	}

	/** Creates a point/path/curve/spine/branch/road/growth guide descriptor. */
	guide(input = {}) {
		return createGuideDescriptor(input);
	}

	/** Creates a scalar or vector procedural field descriptor. */
	field(input = {}) {
		return createFieldDescriptor(input);
	}

	/** Creates a surface capable of future sampling, projection, scattering, or conforming. */
	surface(input = {}) {
		return createSurfaceDescriptor(input);
	}

	/** Creates a bounded or field-backed volume descriptor. */
	volume(input = {}) {
		return createVolumeDescriptor(input);
	}

	/** Creates a spatial/topological/symmetry/avoidance constraint descriptor. */
	constraint(input = {}) {
		return createConstraintDescriptor(input);
	}

	/** Creates scatter/array/density/orientation/jitter/symmetry distribution intent. */
	distribution(input = {}) {
		return createDistributionDescriptor(input);
	}

	/** Creates a portable optional resource request with explicit fallback and cache intent. */
	resource(input = {}) {
		return createResourceDescriptor(input);
	}
}
