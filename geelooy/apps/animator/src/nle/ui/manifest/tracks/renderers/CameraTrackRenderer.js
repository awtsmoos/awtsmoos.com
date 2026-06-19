// B"H
import { HTMLGenerator } from '../../../../../core/ui/HTMLGenerator.js';

export class CameraTrackRenderer {
  static render(event, core, trackType) {
    const leftPx = core.timeToPixels(event.start);
    const widthPx = core.timeToPixels(event.end - event.start);
    const label = `Shot: ${event.shotType || 'Custom'}`;
    const icon = '🎥 ';

    return HTMLGenerator.generate({
      tag: 'div',
      attr: { 
        className: 'nle-clip nle-clip-camera',
        style: { left: `${leftPx}px`, width: `${Math.max(14, widthPx)}px` },
        'data-start': event.start,
        'data-end': event.end,
        'data-event-data': encodeURIComponent(JSON.stringify(event)),
        'data-context-type': 'clip',
        'data-context-id': event.id
      },
      children: [
        { tag: 'div', attr: { className: 'clip-drag-left' } },
        { tag: 'span', attr: { className: 'clip-label', title: label }, children: icon + label }, 
        { tag: 'div', attr: { className: 'clip-drag-right' } }
      ]
    });
  }
}