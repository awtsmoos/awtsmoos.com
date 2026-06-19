import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { WindowMatrix } from './WindowMatrix.js';
import { RoofStructures } from './RoofStructures.js';

/**
 * @class BuildingFacade
 * @description
 * THE FACE OF THE TOWER.
 * B"H
 */
export class BuildingFacade {
  static build(data) {
    const w = data.w || 120;
    const h = data.h || 400;
    const color = data.color || '#34495e';
    const timeOfDay = data.timeOfDay !== undefined ? data.timeOfDay : 0.5;

    const elements = [
      G.rect('main_struct', 0, -h, w, h, { fill: color, stroke: '#000', lineWidth: 4 }),
      // Pass the timeOfDay into the matrix!
      WindowMatrix.build(w, h, data.x, timeOfDay),
      RoofStructures.build(w, h)
    ];

    // B"H - Adding a Fire Escape (The Zig-Zag descent)
    if (w > 150) {
      const escapeX = w - 30;
      const floors = Math.floor(h / 60);
      for (let f = 1; f < floors; f++) {
        const fy = -f * 60;
        elements.push(
          G.rect(`fe_plat_${f}`, escapeX - 10, fy, 40, 5, { fill: '#222' }),
          G.path(`fe_stair_${f}`, [{type:'move',x:escapeX,y:fy}, {type:'line',x:escapeX-20,y:fy+40}], {stroke:'#222', lineWidth:3})
        );
      }
    }

    return G.group(`bld_${data.x}`, { x: data.x, y: data.y }, elements);
  }
}