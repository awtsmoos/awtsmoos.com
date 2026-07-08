// B"H
/** @file buildings.js @description Chapter 356: Houses receive blueprints and interior NPCs. */
import { HousePresets } from '../../../../utils/3d/procedural/house/data/HousePresets.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { NPC_MANIFEST } from '../npcManifest.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { makeNpcDefinition } from './npcDefinitions.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
function clonePreset(preset) { return JSON.parse(JSON.stringify(preset || HousePresets.SingleRoom)); }
export function addBuildings(n, properties) {
  properties.forEach((prop, index) => {
    const preset = HousePresets[prop.housePreset], blueprint = typeof preset === 'function' ? preset(prop.housePresetArg) : clonePreset(preset);
    blueprint.npcs = NPC_MANIFEST.filter(npc => npc.propertyId === prop.id).map((npc, i) => makeNpcDefinition(npc, index + i));
    blueprint.spawnFurniture = blueprint.spawnFurniture === true;
    blueprint.maxFurniture = Number.isFinite(blueprint.maxFurniture) ? Math.min(blueprint.maxFurniture, 9) : 5;
    n.ProceduralBuilding[`${prop.id}_house`] = { name: prop.name, blueprint, position: { x: prop.center.x, y: 0.1, z: prop.center.z }, rotation: { y: ((index % 5) - 2) * 0.035 }, isSolid: true, interactable: true };
  });
}
