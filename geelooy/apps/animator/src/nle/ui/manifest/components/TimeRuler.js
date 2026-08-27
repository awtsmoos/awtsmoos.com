
// B"H
import { HTMLGenerator } from '../../../../core/ui/HTMLGenerator.js';

export class TimeRuler {
  static render(durationMs, core) {
    const totalSec = Math.ceil(durationMs / 1000);
    const marks = [];

    for (let i = 0; i <= totalSec; i++) {
      const left = core.timeToPixels(i * 1000);
      const isMajor = i % 5 === 0;

      marks.push({
        tag: 'div',
        attr: { 
          className: `ruler-mark ${isMajor ? 'major' : 'minor'}`,
          style: { left: `${left}px`, position: 'absolute' }
        },
        children: isMajor ? [{ tag: 'span', children: `${i}s` }] : []
      });
    }

    return HTMLGenerator.generate({
      tag: 'div',
      attr: { className: 'nle-ruler-container' },
      events: {
        mousedown: (e) => {
           const rect = e.currentTarget.getBoundingClientRect();
           const viewport = document.getElementById('nle-viewport');
           if (!viewport) return;
           
           const absoluteX = (e.clientX - rect.left) + viewport.scrollLeft;
           const timeMs = core.pixelsToTime(absoluteX);
           
           core.seek(timeMs);
           core.state.notify('nle_scrubbed', timeMs);
        }
      },
      children: marks
    });
  }
}
