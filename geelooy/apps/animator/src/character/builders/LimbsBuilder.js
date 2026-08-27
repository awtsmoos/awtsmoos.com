
import { VirtualGraph as G } from '../../engine/graph/VirtualGraph.js';
import { ANATOMY } from '../data/Anatomy.js';
import { PerspectiveManager } from '../anatomy/PerspectiveManager.js';

/**
 * @class LimbsBuilder
 * @description
 * THE CHESED, GEVURAH, NETZACH, AND HOD.
 * B"H
 */
export class LimbsBuilder {
  static buildLegs(data) {
    const pantsColor = data.colors?.pants || '#1a1a1a';
    const l = ANATOMY.legs;
    const profile = PerspectiveManager.get(data.view);
    const { hipL=0, hipR=0, bob=0 } = data.walk || {};

    const stretch = 1 - (Math.abs(bob) / 350);

    const buildLeg = (id, x, angle, dir) => {
      const fullLen = (l.thighLength + l.calfLength) * stretch;
      
      // FULL PANTS GEOMETRY: No skin gaps.
      const legPoints = [
        { type: 'move', x: 0, y: -10 }, // Deep overlap into Pelvis
        { type: 'line', x: 0, y: fullLen }
      ];

      return G.group(id, { x, y: l.pivotY, rotation: angle }, [
        G.path('leg_out', legPoints, { stroke: '#000', lineWidth: l.width + 7, lineCap: 'round' }),
        G.path('leg_fill', legPoints, { stroke: pantsColor, lineWidth: l.width, lineCap: 'round' }),
        G.group('shoe_anchor', { y: fullLen }, [
           this.buildShoe(data.shoeType || 'boots', dir)
        ])
      ]);
    };

    return G.group('legs_layer', null, [
      buildLeg('leg_L', -profile.legs.spread, hipL, -1),
      buildLeg('leg_R', profile.legs.spread, hipR, 1)
    ]);
  }

  static buildShoe(type, dir) {
    const w = 48;
    const h = 20;
    const fill = type === 'boots' ? '#2d1a0a' : (type === 'sneakers' ? '#fff' : '#000');
    return G.group('shoe', { y: 6 }, [
      G.rect('base', -w/2, -h/2, w, h, { fill, stroke: '#000', lineWidth: 3.5, radius: 6 }),
      type === 'sneakers' ? G.rect('toe', w/5, -h/2, w/3, h, { fill: '#ddd', radius: [0, 6, 6, 0] }) : null
    ]);
  }

  static buildArm(data, side) {
    const clothes = data.colors?.clothes || '#ff0000';
    const skin = data.colors?.skin || '#ffdbac';
    const a = ANATOMY.arms;
    const profile = PerspectiveManager.get(data.view);
    const isLeft = side === 'left';
    let pivotX = isLeft ? -profile.arms.spread : profile.arms.spread;
    let shoulderAngle = isLeft ? 15 : -15;
    if (data.walk) shoulderAngle += (isLeft ? data.walk.armL : data.walk.armR);

    const armLen = a.upperLength + a.lowerLength;
    const armPoints = [ { type: 'move', x: 0, y: 0 }, { type: 'line', x: 0, y: armLen } ];

    return G.group(`arm_${side}`, { x: pivotX, y: a.pivotY, rotation: shoulderAngle }, [
      G.path('arm_out', armPoints, { stroke: '#000', lineWidth: a.thickness + 6, lineCap: 'round' }),
      G.path('arm_fill', armPoints, { stroke: clothes, lineWidth: a.thickness, lineCap: 'round' }),
      G.circle('hand', 0, armLen, a.handRadius, { fill: skin, stroke: '#000', lineWidth: 3 })
    ]);
  }
}
