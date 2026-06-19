
// B"H
import { HTMLGenerator } from '../../../../core/ui/HTMLGenerator.js';

export class PlayheadUI {
  static render() {
    return HTMLGenerator.generate({
      tag: 'div', 
      attr: { id: 'tl-playhead', className: 'nle-playhead' }
    });
  }

  static update(element, ms, core) {
    if (!element) return;
    
    const px = core.timeToPixels(ms);
    const absoluteX = 200 + px; 
    
    element.style.transform = `translateX(${absoluteX}px)`; 

    if (core.director && core.director.isPlaying && !window.AWTSMOOS_IS_SCRUBBING) {
      const viewport = document.getElementById('nle-viewport');
      if (viewport) {
        const scrollThreshold = viewport.scrollLeft + viewport.clientWidth * 0.8;
        
        if (absoluteX > scrollThreshold) {
          viewport.scrollLeft = absoluteX - (viewport.clientWidth * 0.5);
        }
        
        if (ms < 100 && viewport.scrollLeft > 0) {
          viewport.scrollLeft = 0;
        }
      }
    }
  }
}
