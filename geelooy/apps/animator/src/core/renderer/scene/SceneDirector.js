
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { EnvironmentBuilders as EB } from './EnvironmentBuilders.js';

/**
 * @class SceneDirector
 * @description
 * THE ORCHESTRATOR OF REALITY.
 * B"H
 * Now dynamically utilizing the hyper-fragmented sub-modules for environment rendering!
 */
export class SceneDirector {
  static getActiveEnvironment(sequence, time) {
    if (!sequence || !sequence.events) return 'park';
    const active = sequence.events.find(e => e.type === 'scene_change' && time >= e.start && time <= e.end);
    return active ? active.sceneType : 'park';
  }

  static buildEnvironment(type, realTime, cx, cy, camX, camY, zoom, sceneData) {
    const nodes = [];
    
    if (type === 'living_room') {
      nodes.push(G.rect('wall', -5000, -5000, 10000, 10000, { fill: '#6c5b7b' })); 
      nodes.push(G.rect('floor', -5000, 60, 10000, 5000, { fill: '#8b4513' })); 
      nodes.push(EB.bench({ x: -120, y: 60, scale: 0.8 })); 
    } 
    else {
      // 0. B"H - Default World State: Ensuring the Soul doesn't wander in the Void
      const isNight = sceneData?.timeOfDay > 0.5;
      const bColor = isNight ? '#05070a' : '#1a1d23';
      
      // Infinite Silhouette: Distant cityscape
      const cityBuildings = [];
      for(let i=0; i<15; i++) {
        const bx = -2000 + i * 300 + (Math.sin(i) * 50);
        const bh = 400 + Math.random() * 600;
        const bw = 150 + Math.random() * 100;
        cityBuildings.push(G.rect(`bg_bld_${i}`, bx - bw/2, -bh, bw, bh, { fill: bColor, stroke: '#000', lineWidth: 1 }));
      }
      nodes.push(G.group('deep_background', { x: camX * 0.95, y: 0 }, cityBuildings));

      // 1. The PARK (Nature)
      if (sceneData?.background) {
         nodes.push(G.rect('sky_bg', -5000, -5000, 10000, 10000, { 
             fill: sceneData.background.skyColorBottom || '#fff' 
         }));
      }

      // 1. Deep Parallax Mountains
      if (sceneData?.mountains) {
        const mnts = sceneData.mountains.map(m => m.type ? EB[m.type](m) : EB.mountain(m));
        nodes.push(G.group('parallax_mnts', { x: camX * 0.8, y: 0 }, mnts));
      }
      
      // 2. Parallax Buildings
      if (sceneData?.buildings) {
        const blds = sceneData.buildings.map(b => b.type ? EB[b.type](b) : EB.building(b));
        nodes.push(G.group('parallax_blds', { x: camX * 0.5, y: 0 }, blds));
      }

      // 3. Ground
      const groundY = sceneData?.groundY || 60;
      if (sceneData?.background) {
         nodes.push(G.rect('ground_rect', -5000, groundY, 10000, 2000, { fill: sceneData.background.groundColor || '#eee' }));
      }
      
      // 4. B"H - THE GROUND BREATH (Grass via EB.tree)
      const grassClusters = [];
      const grassCount = 30;
      for (let i = 0; i < grassCount; i++) {
        const gx = -4000 + i * (8000/grassCount) + (Math.sin(i) * 50);
        const sway = Math.sin(realTime * 0.003 + i) * 5;
        grassClusters.push(EB.tree({ x: gx, y: groundY + 5, size: 20 + sway, color: '#2d5a27' }));
      }
      nodes.push(G.group('grass_field', { x: camX * 0.1 }, grassClusters));

      // 5. B"H - Custom Props from EB
      if (sceneData?.props) {
        sceneData.props.forEach(p => {
          if (EB[p.type]) {
            nodes.push(EB[p.type]({ ...p, y: groundY, realTime }));
          }
        });
      }
    }

    return nodes;
  }
}
