// B"H
import { Medabeir } from './Medabeir.js';

/** Chossid: a test medabeir avatar until the GLB actor enters this runtime. */
export class Chossid extends Medabeir {
  constructor(options = {}) {
    super({ color: '#111820', size: { x: 0.8, y: 1.8, z: 0.8 }, speed: 5.2, ...options });
    this.type = 'chossid';
    this.hatColor = options.hatColor || '#050608';
    this.beardColor = options.beardColor || '#8b3a12';
  }
  toRenderState() { return { ...super.toRenderState(), hatColor: this.hatColor, beardColor: this.beardColor }; }
}
