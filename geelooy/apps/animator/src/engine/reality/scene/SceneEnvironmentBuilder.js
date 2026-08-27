
// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { GroundPlane } from '../../../world/generation/terrain/GroundPlane.js';
import { GroundClutter } from '../../../world/generation/terrain/GroundClutter.js';
import { MountainRange } from '../../../world/generation/terrain/MountainRange.js';
import { ProceduralCityForge } from '../../../world/generation/urban/ProceduralCityForge.js';
import { TreeGenerator } from '../../../world/generation/nature/TreeGenerator.js';

export class SceneEnvironmentBuilder {
  static build(sceneData, timeOfDay, realTime, camera, width) {
    const nodes = [];
    const camX = camera.x || 0;
    
    if (sceneData?.mountains && sceneData.mountains.length > 0) {
      const mnts = sceneData.mountains.map(m => MountainRange.build(m));
      nodes.push(G.group('parallax_mnts', { x: camX * 0.9 }, mnts)); 
    }
    
    if (sceneData?.buildings && sceneData.buildings.length > 0) {
      const blds = sceneData.buildings.map(b => ProceduralCityForge.build(b, {x: b.x, y: b.y}, realTime));
      nodes.push(G.group('parallax_blds', { x: camX * 0.6 }, blds));
    }

    const groundY = sceneData?.groundY || 120;
    nodes.push(GroundPlane.build(groundY, width, 500, timeOfDay, realTime));
    nodes.push(GroundClutter.build(-3000, 3000, groundY - 10));

    if (sceneData?.foliage && sceneData.foliage.length > 0) {
      const plants = sceneData.foliage.map(f => TreeGenerator.generate(f.x, f.y, f.size, realTime, f.x));
      nodes.push(G.group('parallax_foliage', { x: camX * 0.1 }, plants));
    }

    return nodes;
  }
}
