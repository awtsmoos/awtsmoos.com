// B"H
import { SaveUtils } from '../utils/SaveUtils.js';

export class SceneSection {
  static render(event, state, app) {
    return {
      tag: 'div',
      attr: { className: 'inspector-section manifest-scene-section' },
      children: [
        { tag: 'h4', attr: { className: 'manifest-section-title manifest-section-title-warn' }, children: 'SCENE PARAMETERS' },
        {
          tag: 'div',
          attr: { className: 'manifest-row' },
          children: [
            { tag: 'span', attr: { className: 'manifest-row-label' }, children: 'Time of Day' },
            {
              tag: 'input',
              attr: { type: 'range', min: '0', max: '1', step: '0.01', value: event.timeOfDay || 0.5, className: 'manifest-range-input' },
              events: { input: e => { event.timeOfDay = parseFloat(e.target.value); SaveUtils.resave(event, state, app); } }
            }
          ]
        }
      ]
    };
  }
}
