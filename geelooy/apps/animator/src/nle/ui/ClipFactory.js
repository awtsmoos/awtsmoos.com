
/* B”H */
import { HTMLGenerator } from '../../core/ui/HTMLGenerator.js';

/**
 * @class ClipFactory
 * @description
 * Creates the physical vessels for timeline sparks. 
 * Every event in the 2-minute test scene is parsed here and 
 * manifested as an interactive DOM element.
 */
export class ClipFactory {
  static create(event, trackDuration) {
    const startPct = (event.start / trackDuration) * 100;
    const endPct = (event.end / trackDuration) * 100;
    const widthPct = endPct - startPct;

    const label = event.speech || event.id || event.type;

    return HTMLGenerator.generate({
      tag: 'div',
      attr: { 
        className: `nle-clip nle-clip-${event.type || 'generic'}`,
        style: { left: `${startPct}%`, width: `${widthPct}%` },
        'data-id': event.id,
        'data-start': event.start,
        'data-end': event.end
      },
      children: [
        { tag: 'div', attr: { className: 'clip-drag-handle left' } },
        { tag: 'span', attr: { className: 'clip-text' }, children: label },
        { tag: 'div', attr: { className: 'clip-drag-handle right' } }
      ]
    });
  }
}
