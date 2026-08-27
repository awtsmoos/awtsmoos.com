
// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

export class GroundPlane {
  static build(groundY, width, height, timeOfDay, realTime) {
    const isNight = timeOfDay > 0.5;
    const earthColor = isNight ? '#0a1a0f' : '#27ae60';
    const sidewalkColor = isNight ? '#333333' : '#a0a0a0';
    const roadColor = isNight ? '#050505' : '#222222';
    const elements = [];

    elements.push(G.rect('ground_mass', -50000, groundY - 20, 100000, 5000, { fill: earthColor }));

    const sidewalkY = groundY - 10;
    const sidewalkH = 60;
    elements.push(G.rect('sidewalk', -50000, sidewalkY, 100000, sidewalkH, { fill: sidewalkColor, stroke: '#000000', lineWidth: 6 }));

    for (let c = -10000; c < 10000; c += 250) {
      elements.push(G.path(`sidewalk_crack_${c}`, [
        { type: 'move', x: c, y: sidewalkY },
        { type: 'line', x: c, y: sidewalkY + sidewalkH }
      ], { stroke: '#000000', lineWidth: 4 }));
    }

    const roadY = sidewalkY + sidewalkH;
    const roadHeight = 300;
    elements.push(G.rect('the_road_bed', -50000, roadY, 100000, roadHeight, { fill: roadColor, stroke: '#000000', lineWidth: 8 }));

    const dashLength = 120;
    const gapLength = 100;
    const centerLaneY = roadY + (roadHeight / 2);
    for (let i = -10000; i < 10000; i += (dashLength + gapLength)) {
      elements.push(G.path(`road_dash_${i}`, [
        { type: 'move', x: i, y: centerLaneY },
        { type: 'line', x: i + dashLength, y: centerLaneY }
      ], { stroke: '#f1c40f', lineWidth: 10, lineCap: 'butt' }));
    }

    return G.group('earth_foundation', null, elements);
  }
}
