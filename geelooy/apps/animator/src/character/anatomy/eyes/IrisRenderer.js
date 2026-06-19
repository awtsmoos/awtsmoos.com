// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

export class IrisRenderer {
  static render(saccadeX, saccadeY, pupilSize, pupilRad, eyeColor) {
    return G.group('iris_pivot', { x: saccadeX, y: saccadeY }, [
      G.circle('iris', 0, 0, pupilSize * 2, { fill: eyeColor }),
      G.circle('iris_ring', 0, 0, pupilSize * 1.5, { stroke: '#000000', lineWidth: 1.5 }),
      G.circle('pupil', 0, 0, pupilRad, { fill: '#000' }),
      G.circle('iris_border', 0, 0, pupilSize * 2, { stroke: '#000000', lineWidth: 1 }),
      G.circle('glint_main', -pupilRad*0.45, -pupilRad*0.45, pupilRad*0.5, { fill: '#ffffff', opacity: 0.9 }),
      G.circle('glint_side', pupilRad*0.4, pupilRad*0.2, pupilRad*0.15, { fill: '#ffffff', opacity: 0.6 }),
    ]);
  }
}
