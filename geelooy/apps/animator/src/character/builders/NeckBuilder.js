
import { VirtualGraph as G } from '../../engine/graph/VirtualGraph.js';
import { ANATOMY } from '../data/Anatomy.js';

/**
 * @file NeckBuilder.js
 * @description
 * THE RECTIFIED PILLAR (Tzavar).
 * Creates a physical bridge matching the structural offset kinematics of the Head, 
 * but outputs directly as an independent G.group.
 * Dropping 65+ pixels seamlessly connects the gap avoiding any rendering artifacts.
 */
export class NeckBuilder {
  static build(data) {
    const skin = data.colors?.skin || '#ffdbac';
    const h = ANATOMY.head;
    const profile = data.partzufProfile;
    
    const { sway = 0, headBob = 0 } = data.idle || {};
    const walkBob = data.walk?.bob || 0;
    const headTilt = data.headTilt || 0;
    const jawDrop = (data.vocalIntensity || 0) * 18;

    const headTransform = {
      x: h.cx + (profile.head.x || 0) + sway,
      y: h.cy + headBob - walkBob,
      rotation: (sway * 0.005) + headTilt
    };

    const width = 16; 
    // Massive base drop guaranteeing collar penetration deeply underneath Body coordinates
    const baseDrop = 70 + (jawDrop * 0.5); 

    const points = [
      { type: 'move', x: -width, y: -25 }, 
      { type: 'line', x: width, y: -25 },
      { type: 'bezier', c1x: width+5, c1y: baseDrop*0.5, c2x: width+15, c2y: baseDrop, x: width+10, y: baseDrop }, 
      { type: 'bezier', c1x: -width-5, c1y: baseDrop*0.5, c2x: -width-15, c2y: baseDrop, x: -width-10, y: baseDrop } 
    ];

    return G.group('master_neck', headTransform, [
      G.path('neck_outline', points, { 
        stroke: '#000000', 
        lineWidth: 10, 
        lineJoin: 'round',
        lineCap: 'round' 
      }),
      G.path('neck_flesh', points, { 
        fill: skin, 
        stroke: skin, 
        lineWidth: 2 
      }),
      // B"H - Hyperrealistic Tendon Definition (Sternocleidomastoid) with crisp vectors
      G.path('scm_L', [
        { type: 'move', x: -width * 0.8, y: -10 },
        { type: 'bezier', c1x: -width * 0.6, c1y: baseDrop * 0.3, c2x: -width * 0.5, c2y: baseDrop * 0.6, x: -width * 0.4, y: baseDrop }
      ], { stroke: '#000000', lineWidth: 1.5, lineCap: 'round' }),
      G.path('scm_R', [
        { type: 'move', x: width * 0.8, y: -10 },
        { type: 'bezier', c1x: width * 0.6, c1y: baseDrop * 0.3, c2x: width * 0.5, c2y: baseDrop * 0.6, x: width * 0.4, y: baseDrop }
      ], { stroke: '#000000', lineWidth: 1.5, lineCap: 'round' }),
      
      // B"H - Adam's Apple with dynamic swallow logic
      G.group('adams_apple', { x: 0, y: baseDrop * 0.3 - (data.swallow || 0) * 10 }, [
        G.path('thyroid_cartilage_L', [
          { type: 'move', x: -4, y: -4 }, { type: 'line', x: 0, y: 0 }
        ], { stroke: '#000000', lineWidth: 1.5, lineCap: 'round' }),
        G.path('thyroid_cartilage_R', [
          { type: 'move', x: 4, y: -4 }, { type: 'line', x: 0, y: 0 }
        ], { stroke: '#000000', lineWidth: 1.5, lineCap: 'round' })
      ]),

      // Sharp under-chin hatching for occlusion
      G.path('neck_chin_occlusion', [
        { type: 'move', x: -width * 0.8, y: -3 }, { type: 'line', x: width * 0.8, y: -3 },
        { type: 'move', x: -width * 0.6, y: 2 }, { type: 'line', x: width * 0.6, y: 2 },
        { type: 'move', x: -width * 0.4, y: 7 }, { type: 'line', x: width * 0.4, y: 7 },
      ], { stroke: '#000000', lineWidth: 1.5, lineCap: 'round' })
    ]);
  }
}
