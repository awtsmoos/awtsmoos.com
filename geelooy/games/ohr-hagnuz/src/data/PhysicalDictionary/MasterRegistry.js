
import { Terrain } from './Terrain.js';
import { Flora } from './Flora.js';
import { Architecture } from './Architecture.js';
import { LivingSouls } from './LivingSouls.js';
import { Gateways } from './Gateways.js';

/**
 * B"H
 * @file MasterRegistry.js
 * @chapter The Sefirah of Tiferet (Harmony)
 * @description
 * The grand unification of all physical elements. The WorldMapAssembler consults this 
 * absolute truth to weave the disparate Otiot into a cohesive reality.
 */
export const MasterRegistry = {
    ...Terrain,
    ...Flora,
    ...Architecture,
    ...LivingSouls,
    ...Gateways,
    'default': { t: 'G_VOID', solid: true, desc: 'Nothingness.' }
};
