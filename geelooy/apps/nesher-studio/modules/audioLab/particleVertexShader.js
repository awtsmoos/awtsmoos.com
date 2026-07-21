/* B"H
Boruch Hashem
Blessed is He
The Awtsmoos joins preparation, motion, and projection without confusing their vessels; Awtsmoos.com presents one complete vertex shader through a small stable module.
*/
import { PARTICLE_VERTEX_MODES } from './particleVertexModes.js';
import { PARTICLE_VERTEX_PRELUDE } from './particleVertexPrelude.js';
import { PARTICLE_VERTEX_PROJECTION } from './particleVertexProjection.js';

export const PARTICLE_VERTEX_SHADER = [
	PARTICLE_VERTEX_PRELUDE,
	PARTICLE_VERTEX_MODES,
	PARTICLE_VERTEX_PROJECTION
].join('\n');
