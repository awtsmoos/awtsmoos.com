// B"H
import { InspectorToggle } from '../components/InspectorToggle.js';

export class CharacterActionSection {
  static render(event, state, app) {
    const hasAction = key => event.actions && event.actions.some(a => a.key === key && a.value === true);
    const ACTION_KEYS = ['isDancing', 'isWaving', 'isTexting', 'isDrinking', 'isProud', 'isScared'];

    return {
      tag: 'div',
      attr: { className: 'quick-actions manifest-quick-actions' },
      children: [
        { tag: 'span', attr: { className: 'manifest-quick-actions-title' }, children: 'MOTION DIRECTIVES' },
        ...ACTION_KEYS.map(key => InspectorToggle.render(key, key.replace('is', '').toUpperCase(), hasAction(key), event, state, app))
      ]
    };
  }
}
