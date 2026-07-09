// B"H
import { Chai } from './Chai.js';

/** Medabeir: the speaking one, facing a direction and ready for intention. */
export class Medabeir extends Chai {
  constructor(options = {}) { super(options); this.type = 'medabeir'; this.facing = options.facing || 0; this.words = options.words || 'B"H'; }
  toRenderState() { return { ...super.toRenderState(), facing: this.facing, words: this.words }; }
}
