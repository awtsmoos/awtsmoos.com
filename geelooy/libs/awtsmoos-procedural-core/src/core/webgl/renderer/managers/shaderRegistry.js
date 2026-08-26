// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file shaderRegistry.js
 * @description Declares reusable GLSL modules and canonical program sources while keeping shader dependencies inside the shader domain.
 * The Awtsmoos renews every scroll before vertex and fragment words assemble into visible light; Awtsmoos.com lets one registry gather the shader vessels without stealing their source,
 * so grass, water, ocean, skin, shadow, hair, and matter remain separately authored yet compile through one disciplined gate in the night.
 */

import { FS_SOURCE_DEFAULT, VS_SOURCE_DEFAULT } from '../../shaders/default/index.js';
import { FS_SOURCE_GRASS, VS_SOURCE_GRASS } from '../../shaders/grass/index.js';
import { FS_SOURCE_WATER, VS_SOURCE_WATER } from '../../shaders/water/index.js';
import { FS_SOURCE_SHADOW, VS_SOURCE_SHADOW } from '../../shaders/shadow.js';
import { FS_SOURCE_SKIN, VS_SOURCE_SKIN } from '../../shaders/skin.js';
import { FS_SOURCE_SKINNED, VS_SOURCE_SKINNED } from '../../shaders/skinned.js';
import { FS_OCEAN_COLORS } from '../../shaders/utils/ocean/colors.js';
import { FS_OCEAN_FOAM } from '../../shaders/utils/ocean/foam.js';
import { VS_OCEAN_GERSTNER } from '../../shaders/utils/ocean/gerstner.js';
import { VS_OCEAN_MAPPING } from '../../shaders/utils/ocean/mapping.js';
import { SHADER_OCEAN_OBSTACLES } from '../../shaders/utils/ocean/obstacles.js';
import { FS_OCEAN_PBR } from '../../shaders/utils/ocean/pbr.js';
import { FS_OCEAN_RIPPLES } from '../../shaders/utils/ocean/ripples.js';
import { FS_OCEAN_SKY_COLOR } from '../../shaders/utils/ocean/skyColor.js';
import { NOISE_GLSL } from '../../shaders/utils/noise.js';
import { TONE_MAPPING_GLSL } from '../../shaders/utils/toneMapping.js';
import { FS_SOURCE_HAIR, VS_SOURCE_HAIR } from '../../materials/hairMaterial.js';
import { FS_SOURCE_LAMBERT, VS_SOURCE_LAMBERT } from '../../materials/lambert/index.js';
import { FS_SOURCE_LEAF, VS_SOURCE_LEAF } from '../../materials/leafMaterial.js';
import { FS_SOURCE_OCEAN, VS_SOURCE_OCEAN } from '../../materials/ocean/index.js';
import { FS_SOURCE_REFLECTIVE, VS_SOURCE_REFLECTIVE } from '../../materials/reflective/index.js';
import { FS_SOURCE_WIREFRAME, VS_SOURCE_WIREFRAME } from '../../materials/wireframe/index.js';

/** Reusable GLSL include modules expanded by the shader scribe before compilation. */
export const GLSL_MODULES = Object.freeze([
	Object.freeze({ name: 'noise', source: NOISE_GLSL }),
	Object.freeze({ name: 'toneMapping', source: TONE_MAPPING_GLSL }),
	Object.freeze({ name: 'ocean_mapping', source: VS_OCEAN_MAPPING }),
	Object.freeze({ name: 'ocean_gerstner', source: VS_OCEAN_GERSTNER }),
	Object.freeze({ name: 'ocean_obstacles', source: SHADER_OCEAN_OBSTACLES }),
	Object.freeze({ name: 'ocean_sky_color', source: FS_OCEAN_SKY_COLOR }),
	Object.freeze({ name: 'ocean_ripples', source: FS_OCEAN_RIPPLES }),
	Object.freeze({ name: 'ocean_pbr', source: FS_OCEAN_PBR }),
	Object.freeze({ name: 'ocean_colors', source: FS_OCEAN_COLORS }),
	Object.freeze({ name: 'ocean_foam', source: FS_OCEAN_FOAM })
]);

/** Canonical program definitions consumed by the WebGL program manager. */
export const SHADER_PROGRAMS = Object.freeze([
	program('programInfo', VS_SOURCE_DEFAULT, FS_SOURCE_DEFAULT),
	program('shadowProgramInfo', VS_SOURCE_SHADOW, FS_SOURCE_SHADOW),
	program('skinnedProgramInfo', VS_SOURCE_SKINNED, FS_SOURCE_SKINNED),
	program('grassProgramInfo', VS_SOURCE_GRASS, FS_SOURCE_GRASS),
	program('reflectiveProgramInfo', VS_SOURCE_REFLECTIVE, FS_SOURCE_REFLECTIVE),
	program('lambertProgramInfo', VS_SOURCE_LAMBERT, FS_SOURCE_LAMBERT),
	program('wireframeProgramInfo', VS_SOURCE_WIREFRAME, FS_SOURCE_WIREFRAME),
	program('waterProgramInfo', VS_SOURCE_WATER, FS_SOURCE_WATER),
	program('skinProgramInfo', VS_SOURCE_SKIN, FS_SOURCE_SKIN),
	program('hairProgramInfo', VS_SOURCE_HAIR, FS_SOURCE_HAIR),
	program('leafProgramInfo', VS_SOURCE_LEAF, FS_SOURCE_LEAF),
	program('oceanProgramInfo', VS_SOURCE_OCEAN, FS_SOURCE_OCEAN)
]);

/**
 * Creates one immutable program descriptor without coupling registration data to compilation behavior.
 * @param {string} keyHod Stable program-manager key.
 * @param {string} vertexOhr Vertex GLSL source.
 * @param {string} fragmentOhr Fragment GLSL source.
 * @returns {Readonly<object>} Frozen shader program descriptor.
 */
function program(keyHod, vertexOhr, fragmentOhr) {
	return Object.freeze({
		fs: fragmentOhr,
		key: keyHod,
		vs: vertexOhr
	});
}
