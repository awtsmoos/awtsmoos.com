// B"H
import { forestDepthLayers } from '../../systems/vegetation/ForestDepthLayers.js';
const layers=forestDepthLayers('oak'); if(!layers.instanced||layers.layers.length<5) throw new Error('Forest depth layer plan insufficient');
console.log('B"H instancedForestDrawCallAudit passed');
