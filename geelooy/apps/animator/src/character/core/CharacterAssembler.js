
import { VirtualGraph as G } from '../../engine/graph/VirtualGraph.js';
import { HeadBuilder } from '../parts/HeadBuilder.js';
import { BodyBuilder } from '../parts/BodyBuilder.js';
import { LimbsBuilder } from '../parts/LimbsBuilder.js';
import { ProportionLogic } from './ProportionLogic.js';
import { PerspectiveManager } from '../anatomy/PerspectiveManager.js';

/**
 * @file CharacterAssembler.js
 * @description
 * THE GATHERER OF PARTS.
 * B"H
 * Unifies the spirit and the body. Calculates proportions based on archetype.
 */
export class CharacterAssembler {
  static assemble(data) {
    const props = ProportionLogic.get(data.archetype || 'adult');
    
    // Inject Perspective Profile so HeadBuilder can read it safely
    data.partzufProfile = PerspectiveManager.get(data.view);

    // 1. Build the Parts
    const legs = LimbsBuilder.buildLegs(data);
    const armL = LimbsBuilder.buildArm(data, 'left');
    const torso = BodyBuilder.build(data);
    const head = HeadBuilder.build(data);
    const armR = LimbsBuilder.buildArm(data, 'right');

    const totalScale = props.body;

    return G.group(`entity_${data.id}`, { 
      x: data.position.x, 
      y: data.position.y + props.yOffset, 
      scaleX: (data.flipX ? -1 : 1) * totalScale,
      scaleY: totalScale
    }, [
      legs,
      armL,
      torso,
      head,
      armR
    ]);
  }
}
