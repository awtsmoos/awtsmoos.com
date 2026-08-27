
/* B”H */
import { HTMLGenerator } from '../../../core/ui/HTMLGenerator.js';

export class TimeRuler {
  static render() {
    return HTMLGenerator.generate({
      tag: 'div',
      attr: { className: 'nle-time-ruler' },
      children: Array.from({length: 60}).map((_, i) => ({
        tag: 'div',
        attr: { className: 'ruler-mark', style: { left: `${(i/60)*100}%` } },
        children: i % 5 === 0 ? String(i) : ''
      }))
    });
  }
}
