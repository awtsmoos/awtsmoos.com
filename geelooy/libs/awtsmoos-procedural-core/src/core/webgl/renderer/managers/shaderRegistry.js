
// B"H
/**
 * @file shaderRegistry.js
 * @brief The divine map of all rendering algorithms and modular fragments.
 * 
 * THE HYMN OF THE GATHERED SCROLLS:
 * One fragment here, another there, scattered through the void,
 * Until they meet in unity, no longer to be destroyed!
 * We register the Noise, the Tone, the Gerstner and the Foam,
 * Providing every shader with a place to call its home!
 */

// --- UTILITY MODULES (Injected into others) ---
import { NOISE_GLSL } from '../../shaders/utils/noise.js';
import { TONE_MAPPING_GLSL } from '../../shaders/utils/toneMapping.js';

// --- OCEAN SUB-MODULES ---
import { VS_OCEAN_MAPPING } from '../../shaders/utils/ocean/mapping.js';
import { VS_OCEAN_GERSTNER } from '../../shaders/utils/ocean/gerstner.js';
import { SHADER_OCEAN_OBSTACLES } from '../../shaders/utils/ocean/obstacles.js';
import { FS_OCEAN_SKY_COLOR } from '../../shaders/utils/ocean/skyColor.js';
import { FS_OCEAN_RIPPLES } from '../../shaders/utils/ocean/ripples.js';
import { FS_OCEAN_PBR } from '../../shaders/utils/ocean/pbr.js';
import { FS_OCEAN_COLORS } from '../../shaders/utils/ocean/colors.js';
import { FS_OCEAN_FOAM } from '../../shaders/utils/ocean/foam.js';

// --- MAIN SHADER SOURCES ---
import { VS_SOURCE_DEFAULT, FS_SOURCE_DEFAULT } from '../../shaders/default/index.js';
import { VS_SOURCE_SHADOW, FS_SOURCE_SHADOW } from '../../shaders/shadow.js';
import { VS_SOURCE_SKINNED, FS_SOURCE_SKINNED } from '../../shaders/skinned.js';
import { VS_SOURCE_SKIN, FS_SOURCE_SKIN } from '../../shaders/skin.js';
import { VS_SOURCE_GRASS, FS_SOURCE_GRASS } from '../../materials/grassMaterial.js';
import { VS_SOURCE_REFLECTIVE, FS_SOURCE_REFLECTIVE } from '../../materials/reflective/index.js';
import { VS_SOURCE_LAMBERT, FS_SOURCE_LAMBERT } from '../../materials/lambert/index.js'; 
import { VS_SOURCE_WIREFRAME, FS_SOURCE_WIREFRAME } from '../../materials/wireframe/index.js'; 
import { VS_SOURCE_WATER, FS_SOURCE_WATER } from '../../materials/waterMaterial.js'; 
import { VS_SOURCE_HAIR, FS_SOURCE_HAIR } from '../../materials/hairMaterial.js';
import { VS_SOURCE_LEAF, FS_SOURCE_LEAF } from '../../materials/leafMaterial.js';
import { VS_SOURCE_OCEAN, FS_SOURCE_OCEAN } from '../../materials/ocean/index.js'; 

/**
 * @constant GLSL_MODULES
 * @description Pure data mapping for #include sub-modules used by the Scribe.
 */
export const GLSL_MODULES =[
    { name: 'noise', source: NOISE_GLSL },
    { name: 'toneMapping', source: TONE_MAPPING_GLSL },
    { name: 'ocean_mapping', source: VS_OCEAN_MAPPING },
    { name: 'ocean_gerstner', source: VS_OCEAN_GERSTNER },
    { name: 'ocean_obstacles', source: SHADER_OCEAN_OBSTACLES },
    { name: 'ocean_sky_color', source: FS_OCEAN_SKY_COLOR },
    { name: 'ocean_ripples', source: FS_OCEAN_RIPPLES },
    { name: 'ocean_pbr', source: FS_OCEAN_PBR },
    { name: 'ocean_colors', source: FS_OCEAN_COLORS },
    { name: 'ocean_foam', source: FS_OCEAN_FOAM }
];

/**
 * @constant SHADER_PROGRAMS
 * @description The 12 holy programs required for the manifestation of the Golem's world.
 */
export const SHADER_PROGRAMS =[
    { key: 'programInfo', vs: VS_SOURCE_DEFAULT, fs: FS_SOURCE_DEFAULT },
    { key: 'shadowProgramInfo', vs: VS_SOURCE_SHADOW, fs: FS_SOURCE_SHADOW },
    { key: 'skinnedProgramInfo', vs: VS_SOURCE_SKINNED, fs: FS_SOURCE_SKINNED },
    { key: 'grassProgramInfo', vs: VS_SOURCE_GRASS, fs: FS_SOURCE_GRASS },
    { key: 'reflectiveProgramInfo', vs: VS_SOURCE_REFLECTIVE, fs: FS_SOURCE_REFLECTIVE },
    { key: 'lambertProgramInfo', vs: VS_SOURCE_LAMBERT, fs: FS_SOURCE_LAMBERT },
    { key: 'wireframeProgramInfo', vs: VS_SOURCE_WIREFRAME, fs: FS_SOURCE_WIREFRAME },
    { key: 'waterProgramInfo', vs: VS_SOURCE_WATER, fs: FS_SOURCE_WATER },
    { key: 'skinProgramInfo', vs: VS_SOURCE_SKIN, fs: FS_SOURCE_SKIN },
    { key: 'hairProgramInfo', vs: VS_SOURCE_HAIR, fs: FS_SOURCE_HAIR },
    { key: 'leafProgramInfo', vs: VS_SOURCE_LEAF, fs: FS_SOURCE_LEAF },
    { key: 'oceanProgramInfo', vs: VS_SOURCE_OCEAN, fs: FS_SOURCE_OCEAN }
];
