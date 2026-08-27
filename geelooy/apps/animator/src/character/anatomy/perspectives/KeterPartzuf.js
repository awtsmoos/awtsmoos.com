// B"H
import { BasePartzuf } from './BasePartzuf.js';
import { ANATOMY } from '../../data/Anatomy.js';

/**
 * @class KeterPartzuf
 * @extends BasePartzuf
 * @description
 * THE LOOKING UPWARD (Keter / Crown).
 * Features shift upward, revealing the neck and underside of the jaw.
 */
export class KeterPartzuf extends BasePartzuf {
  constructor() {
    super();
    this.type = 'up';
    this.dir = 0;
    
    const eOff = ANATOMY.face.eyes.offsetX;
    
    // Everything shifts UP
    const yShift = -18;
    this.eyes = {
      visible: ['left', 'right'],
      left: { x: -eOff, y: yShift, scaleX: 1, scaleY: 0.8 },
      right: { x: eOff, y: yShift, scaleX: 1, scaleY: 0.8 }
    };
    this.eyebrows = {
      visible: ['left', 'right'],
      left: { x: -eOff, y: yShift, scaleX: 1 },
      right: { x: eOff, y: yShift, scaleX: 1 }
    };
    this.mouth = { x: 0, y: yShift * 1.5, scaleX: 0.9 };
    this.nose = { x: 0, y: yShift * 1.2 };
    this.ears = { 
      visible: ['left', 'right'],
      left: { y: 15 }, // Ears look lower when face looks up
      right: { y: 15 }
    };
  }
}
