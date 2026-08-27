
// B"H
import { SpineData } from './SpineData.js';
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * @file SpineEngine.js
 * @description
 * THE ARTICULATION OF THE SPINE (Kifuf HaShidrah).
 * B"H
 * Breathes life into the segmented torso, allowing the ribcage to expand 
 * and the shoulders to shrug dynamically.
 */

export class SpineEngine {
  static process(data, suitColor, time) {
    const p = SpineData.proportions;
    const g = SpineData.garments;

    // Respiration Expansion: Only the ribcage expands horizontally!
    const breathExpansion = 1.0 + (Math.sin(time * 0.002) * 0.05) + ((data.stress || 0) * 0.05);
    const torsoSway = data.torsoSway || 0;

    const nodes = [];

    // 1. THE PELVIS
    nodes.push(
      G.rect('spine_pelvis', -p.pelvis.width/2, p.pelvis.yOffset - p.pelvis.height, p.pelvis.width, p.pelvis.height, {
        fill: suitColor, stroke: g.strokeColor, lineWidth: g.strokeWidth, radius: 8
      })
    );

    // 2. THE RIBCAGE
    nodes.push(
      G.group('spine_ribcage_pivot', { x: 0, y: p.ribcage.yOffset, rotation: torsoSway * 0.5, scaleX: breathExpansion }, [
        G.rect('ribcage_box', -p.ribcage.width/2, -p.ribcage.height, p.ribcage.width, p.ribcage.height, {
          fill: suitColor, stroke: g.strokeColor, lineWidth: g.strokeWidth, radius: 10
        }),
        G.path('shirt_seam', [
          { type: 'move', x: 0, y: 0 }, { type: 'line', x: 0, y: -p.ribcage.height }
        ], { stroke: g.creaseAlpha, lineWidth: 2 })
      ])
    );

    // 3. THE SHOULDERS
    const shrug = (data.surprise || 0) * 10;
    nodes.push(
      G.group('spine_shoulder_pivot', { x: 0, y: p.shoulders.yOffset - shrug, rotation: torsoSway }, [
        G.rect('shoulder_box', -p.shoulders.width/2, -p.shoulders.height, p.shoulders.width, p.shoulders.height, {
          fill: suitColor, stroke: g.strokeColor, lineWidth: g.strokeWidth, radius: [15, 15, 0, 0]
        }),
        G.path('tension_L', [
          { type: 'move', x: -p.shoulders.width/2 + 10, y: -5 },
          { type: 'quad', cx: -15, cy: -20, x: -5, y: -p.shoulders.height + 10 }
        ], { stroke: g.creaseAlpha, lineWidth: 1.5 }),
        G.path('tension_R', [
          { type: 'move', x: p.shoulders.width/2 - 10, y: -5 },
          { type: 'quad', cx: 15, cy: -20, x: 5, y: -p.shoulders.height + 10 }
        ], { stroke: g.creaseAlpha, lineWidth: 1.5 })
      ])
    );

    return G.group(`segmented_torso_${data.id}`, null, nodes);
  }
}
