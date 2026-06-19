
/* B”H */
import { HTMLGenerator } from '../../../core/ui/HTMLGenerator.js';

export class TrackHeader {
  static render(name) {
    return HTMLGenerator.generate({
      tag: 'div',
      attr: { className: 'nle-track-header' },
      children: [
        { tag: 'div', attr: { className: 'track-icon' } },
        { tag: 'span', children: name }
      ]
    });
  }
}
