
// B"H
import { DragState } from './DragState.js';
import { DragGhost } from './DragGhost.js';
import { DragMath } from './DragMath.js';

export class NLEDragManager {
  static bind(viewport, core, state, app) {
    if (!viewport) return;

    viewport.addEventListener('mousedown', (e) => {
      const clip = e.target.closest('.nle-clip');
      if (!clip || e.target.classList.contains('clip-drag-left') || e.target.classList.contains('clip-drag-right')) return;
      
      const rawData = clip.getAttribute('data-event-data');
      if (!rawData) return;

      DragState.isDragging = true;
      DragState.originalClip = clip;
      DragState.eventData = JSON.parse(decodeURIComponent(rawData));
      DragState.startX = e.clientX;
      
      const trackLane = clip.parentElement;
      const currentPx = core.timeToPixels(DragState.eventData.start);

      DragGhost.summon(clip, currentPx, trackLane);
    });

    window.addEventListener('mousemove', (e) => {
      if (!DragState.isDragging || !DragState.ghostClip || !DragState.eventData) return;

      window.AWTSMOOS_IS_SCRUBBING = true;

      const { snappedMs, snappedPx } = DragMath.evaluate(e.clientX, core, state);
      
      DragGhost.update(snappedPx, snappedMs);
    });

    const endDrag = (e) => {
      if (!DragState.isDragging) return;
      
      window.AWTSMOOS_IS_SCRUBBING = false;

      if (DragState.ghostClip && DragState.eventData) {
        const newStartMs = parseFloat(DragState.ghostClip.dataset.pendingStart);
        
        if (!isNaN(newStartMs) && newStartMs !== DragState.eventData.start) {
          const duration = DragState.eventData.end - DragState.eventData.start;
          const seq = state.get('activeSequence');
          
          const idx = seq.events.findIndex(ev => ev.id === DragState.eventData.id && ev.start === DragState.eventData.start && ev.type === DragState.eventData.type);
          
          if (idx > -1) {
            seq.events[idx].start = newStartMs;
            seq.events[idx].end = newStartMs + duration;
            state.set('activeSequence', { ...seq });
            
            if (app.timeline) app.timeline.refreshTracks();
          }
        }

        DragGhost.banish();
      }
      
      DragState.reset();
    };

    window.addEventListener('mouseup', endDrag);
  }
}
