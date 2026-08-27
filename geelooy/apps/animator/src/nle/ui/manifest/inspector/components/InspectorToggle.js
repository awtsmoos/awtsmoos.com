// B"H
import { SaveUtils } from '../utils/SaveUtils.js';

export class InspectorToggle {
  static render(actionKey, label, isActive, event, state, app) {
    return {
      tag: 'button',
      attr: { className: `btn btn-sm ${isActive ? 'btn-primary' : ''}` },
      children: label,
      events: {
        click: () => {
          if (!event.actions) event.actions = [];
          const existingIdx = event.actions.findIndex(a => a.key === actionKey);
          if (existingIdx > -1) event.actions.splice(existingIdx, 1);
          else event.actions.push({ at: 0, key: actionKey, value: true });
          SaveUtils.resave(event, state, app);
          import('../InspectorPanel.js').then(({ InspectorPanel }) => {
            InspectorPanel.show(event, document.getElementById('inspector-mount'), state, app);
          });
        }
      }
    };
  }
}