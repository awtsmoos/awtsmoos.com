// B"H
/** @file BiomeDirector.js @description Builds all biome summaries. */
import { villageCoreBiome } from './VillageCoreBiome.js';import { farmBeltBiome } from './FarmBeltBiome.js';import { orchardBiome } from './OrchardBiome.js';import { forestBiome } from './ForestBiome.js';import { marshBiome } from './MarshBiome.js';import { rockyHighlandsBiome } from './RockyHighlandsBiome.js';
export function buildBiomePlan(){return [villageCoreBiome(),farmBeltBiome(),orchardBiome(),forestBiome(),marshBiome(),rockyHighlandsBiome()];}
