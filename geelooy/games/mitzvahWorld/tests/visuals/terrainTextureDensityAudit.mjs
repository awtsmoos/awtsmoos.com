// B"H
import { uvDensityForSize, auditUvDensity } from '../../systems/terrain/TerrainUvDensity.js';
import { terrainLayerStack } from '../../systems/terrain/TerrainTextureLayers.js';
const uv=uvDensityForSize(200,200,4); const audit=auditUvDensity({width:200,depth:200,...uv});
if(!audit.ok) throw new Error('Terrain UV density failed');
if(!terrainLayerStack({slope:.8,height:30}).micro.includes('pebble-normal')) throw new Error('Terrain micro layer missing');
console.log('B"H terrainTextureDensityAudit passed');
