// B"H
import { SaveUtils } from '../utils/SaveUtils.js';

export class JSONSection {
  static render(event, state, app) {
    return {
      tag: 'details',
      attr: { className: 'manifest-json-section' },
      children: [
        { tag: 'summary', attr: { className: 'manifest-json-summary' }, children: 'RAW JSON' },
        {
          tag: 'textarea',
          attr: { className: 'manifest-textarea manifest-json-textarea' },
          children: JSON.stringify(event, null, 2),
          events: {
            change: e => {
              try {
                const updated = JSON.parse(e.target.value);
                Object.assign(event, updated);
                SaveUtils.resave(event, state, app);
              } catch (err) {
                console.warn('B"H - Invalid JSON in raw editor.', err);
              }
            }
          }
        }
      ]
    };
  }
}
