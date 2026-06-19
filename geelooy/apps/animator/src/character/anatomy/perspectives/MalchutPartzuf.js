// B"H
import { BasePartzuf } from './BasePartzuf.js';
import { ANATOMY } from '../../data/Anatomy.js';

/**
 * @class MalchutPartzuf
 * @extends BasePartzuf
 * @description
 * THE LOOKING DOWNWARD (Malchut / Kingdom).
 * Features shift downward, revealing the top of the head.
 */
export class MalchutPartzuf extends BasePartzuf {
  constructor() {
    super();
    this.type = 'down';
    this.dir = 0;
    
    const eOff = ANATOMY.face.eyes.offsetX;
    
    // Everything shifts DOWN
    const yShift = 15;
    this.eyes = {
      visible: ['left', 'right'],
      left: { x: -eOff, y: yShift, scaleX: 1, scaleY: 0.8 },
      right: { x: eOff, y: yShift, scaleX: 1, scaleY: 0.8 }
    };
    this.eyebrows = {
      visible: ['left', 'right'],
      left: { x: -eOff, y: yShift * 1.5, scaleX: 1 },
      right: { x: eOff, y: yShift * 1.5, scaleX: 1 }
    };
    this.mouth = { x: 0, y: yShift * 0.5, scaleX: 0.8 };
    this.nose = { x: 0, y: yShift * 1.2 };
    this.ears = { 
      visible: ['left', 'right'],
      left: { y: -15 }, // Ears look higher when face looks down
      right: { y: -15 }
    };
  }
}
