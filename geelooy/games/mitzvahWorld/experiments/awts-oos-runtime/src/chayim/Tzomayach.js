// B"H
import { Domem } from './Domem.js';

/** Tzomayach: growth from stillness, swaying grass and trees in Eretz. */
export class Tzomayach extends Domem {
  constructor(options = {}) { super(options); this.type = 'tzomayach'; this.sway = options.sway || 0; this.proximity = options.proximity || 0; }
  heesHawvoos(dt, runtime) { this.sway += dt; if (this.proximity) runtime.events.emit('tzomayach:pulse', { id: this.id }); }
  toRenderState() { return { ...super.toRenderState(), sway: this.sway, proximity: this.proximity }; }
}
