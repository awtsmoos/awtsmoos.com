
/* B”H */
import { HTMLGenerator } from '../../core/ui/HTMLGenerator.js';

/**
 * @class ClipRenderer
 * @description
 * Converts a sequence event spark into a manifest visual clip on the timeline.
 */
export class ClipRenderer {
  static render(event, totalDuration, trackType) {
    const startPct = (event.start / totalDuration) * 100;
    const endPct = (event.end / totalDuration) * 100;
    const widthPct = endPct - startPct;
    
    const label = event.speech || event.id || event.type;
    const colorClass = `nle-clip-${trackType.toLowerCase()}`;

    return HTMLGenerator.generate({
      tag: 'div',
      attr: { 
        className: `nle-clip ${colorClass}`,
        style: { left: `${startPct}%`, width: `${widthPct}%` },
        'data-id': event.id,
        'data-start': event.start,
        'data-end': event.end
      },
      children: [
        { tag: 'div', attr: { className: 'clip-drag-left' } },
        { tag: 'span', attr: { className: 'clip-label' }, children: label },
        { tag: 'div', attr: { className: 'clip-drag-right' } }
      ]
    });
  }
}
