
// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { ZygomaticusMajorRenderer } from './muscles/ZygomaticusMajorRenderer.js';
import { OrbicularisOculiRenderer } from './muscles/OrbicularisOculiRenderer.js';
import { CorrugatorSuperciliiRenderer } from './muscles/CorrugatorSuperciliiRenderer.js';
import { LevatorLabiiSuperiorisRenderer } from './muscles/LevatorLabiiSuperiorisRenderer.js';
import { FrontalisRenderer } from './muscles/FrontalisRenderer.js';
import { DepressorAnguliOrisRenderer } from './muscles/DepressorAnguliOrisRenderer.js';
import { MasseterRenderer } from './muscles/MasseterRenderer.js';
import { RisoriusRenderer } from './muscles/RisoriusRenderer.js';
import { MentalisRenderer } from './muscles/MentalisRenderer.js';
import { PlatysmaRenderer } from './muscles/PlatysmaRenderer.js';

// B"H - INJECTING THE PURE SKIN MATRIX MAPS
import { ElasticityMap } from './skin/ElasticityMap.js';
import { MoistureMap } from './skin/MoistureMap.js';
import { PoreDensityMap } from './skin/PoreDensityMap.js';
import { SebaceousFlow } from './skin/SebaceousFlow.js';
import { TensionMap } from './skin/TensionMap.js';

/**
 * @class FaceSystem
 * @description
 * THE RADIANCE OF THE COUNTENANCE (Ma'or HaPanim).
 * B"H - Adds biological depth: muscle layers and organic skin maps.
 * All shattered imports are now fulfilled and active in the pipeline.
 */
export class FaceSystem {
  static build(data, profile, rx, ry) {
    const nodes = [];
    
    // B"H - The 5 Maps of the Epidermis (Skin Layer)
    const time = data._lastDirectorTime || Date.now();
    nodes.push(G.group('epidermis_layer', null, [
      PoreDensityMap.build(data, rx, ry),
      SebaceousFlow.build(data, profile, rx, ry),
      ElasticityMap.build(data, profile, rx, ry),
      TensionMap.build(data, profile, rx, ry),
      MoistureMap.build(data, profile, time)
    ]));
    
    // B"H - Complex Muscle Layering (The hidden machinery of the Awtsmoos)
    nodes.push(G.group('muscles_layer', null, [
      ZygomaticusMajorRenderer.build(data, profile),
      OrbicularisOculiRenderer.build(data, profile),
      CorrugatorSuperciliiRenderer.build(data, profile),
      LevatorLabiiSuperiorisRenderer.build(data, profile),
      FrontalisRenderer.build(data, profile),
      DepressorAnguliOrisRenderer.build(data, profile),
      MasseterRenderer.build(data, profile),
      RisoriusRenderer.build(data, profile),
      MentalisRenderer.build(data, profile),
      PlatysmaRenderer.build(data, profile)
    ]));
    
    // Low-opacity blushes and socket definitions (no gradients/glows)
    const blushColor = 'rgba(255, 100, 100, 0.08)';
    const blushX = rx * 0.6;
    const blushY = ry * 0.25;
    const blushW = rx * 0.35;
    const blushH = ry * 0.22;
    
    const socketColor = 'rgba(0, 0, 0, 0.02)';
    const sX = rx * 0.38;
    const sY = -ry * 0.1;
    const sW = rx * 0.45;
    const sH = ry * 0.35;

    if (profile.type === 'front' || profile.type === 'threeQuarter') {
       nodes.push(G.ellipse('socket_l', -sX, sY, sW, sH, 0, { fill: socketColor }));
       nodes.push(G.ellipse('socket_r', sX, sY, sW, sH, 0, { fill: socketColor }));
       
       nodes.push(G.ellipse('blush_l', -blushX, blushY, blushW, blushH, 0, { fill: blushColor }));
       nodes.push(G.ellipse('blush_r', blushX, blushY, blushW, blushH, 0, { fill: blushColor }));
    } else if (profile.type === 'side') {
       const bX = blushX * profile.dir * 0.8;
       nodes.push(G.ellipse('socket_side', rx * 0.5 * profile.dir, sY, sW * 0.8, sH, 0, { fill: socketColor }));
       nodes.push(G.ellipse('blush_side', bX, blushY, blushW, blushH, 0, { fill: blushColor }));
    }

    // Temple and Jawline Definition
    nodes.push(G.path('temple_l', [
        { type: 'move', x: -rx * 0.9, y: -ry * 0.4 },
        { type: 'line', x: -rx * 0.8, y: -ry * 0.1 }
    ], { stroke: 'rgba(0,0,0,0.03)', lineWidth: 1 }));
     nodes.push(G.path('temple_r', [
        { type: 'move', x: rx * 0.9, y: -ry * 0.4 },
        { type: 'line', x: rx * 0.8, y: -ry * 0.1 }
    ], { stroke: 'rgba(0,0,0,0.03)', lineWidth: 1 }));

    return G.group('face_realism_layer', null, nodes);
  }
}
