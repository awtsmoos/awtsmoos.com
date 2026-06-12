// B"H
/** @file InstancePool.js @description High-performance instance budget plan. */
import { instancedGrassLayer } from './InstancedGrassLayer.js';import { instancedFlowerLayer } from './InstancedFlowerLayer.js';import { instancedRockLayer } from './InstancedRockLayer.js';import { instancedTreeLayer } from './InstancedTreeLayer.js';
export function buildInstancePlan(ctx){return {grass:instancedGrassLayer(ctx),flowers:instancedFlowerLayer(ctx),rocks:instancedRockLayer(ctx),trees:instancedTreeLayer(ctx),mode:'planned-instanced-density'};}
