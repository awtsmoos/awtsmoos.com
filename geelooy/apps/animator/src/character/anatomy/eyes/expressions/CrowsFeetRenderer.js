// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @file CrowsFeetRenderer.js
 * @description
 * LATERAL CANTHAL EXPANSION LINES.
 */
export class CrowsFeetRenderer {
  static build(id, baseW, dir) {
    const outerX = baseW * dir;
    return G.group(`crows_feet_${id}`, { x: outerX, y: 0 }, [
      G.path('crow1', [{type:'move',x:0,y:0}, {type:'quad',cx:4*dir,cy:-5,x:8*dir,y:-4}], {stroke:'#000', lineWidth:1})
    ]);
  }
}
