// B"H
import { InspectorInput } from '../components/InspectorInput.js';
import { SaveUtils } from '../utils/SaveUtils.js';

export class CharacterPosSection {
  static render(event, state, app) {
    return {
      tag: 'div',
      children: [
        InspectorInput.render('Pos X', event.pos?.x || 0, (val) => { if (!event.pos) event.pos = {}; event.pos.x = parseFloat(val); SaveUtils.resave(event, state, app); }),
        InspectorInput.render('Pos Y', event.pos?.y || 0, (val) => { if (!event.pos) event.pos = {}; event.pos.y = parseFloat(val); SaveUtils.resave(event, state, app); }),
        InspectorInput.render('Scale', event.pos?.scale || 1, (val) => { if (!event.pos) event.pos = {}; event.pos.scale = parseFloat(val); SaveUtils.resave(event, state, app); })
      ]
    };
  }
}