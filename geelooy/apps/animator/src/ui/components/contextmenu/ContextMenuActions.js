// B"H
import { ContextMenuManager } from './ContextMenuManager.js';
import { ContextMenuState } from './ContextMenuState.js';

export class ContextMenuActions {
  static execute(actionKey, state, app) {
    const ev = ContextMenuState.targetEventData;
    
    // A helper to locate the exact event in the sequence array
    const findEventIndex = (seq) => {
      if (!ev || !seq || !seq.events) return -1;
      return seq.events.findIndex(e => e.id === ev.id && e.start === ev.start && e.type === ev.type);
    };

    const ActionRouter = {
      'delete_clip': () => {
        const seq = state.get('activeSequence');
        const idx = findEventIndex(seq);
        if (idx > -1) {
          seq.events.splice(idx, 1);
          state.set('activeSequence', { ...seq });
          if (app.timeline) app.timeline.refreshTracks();
        }
      },
      
      'ripple_delete_clip': () => {
        const seq = state.get('activeSequence');
        const idx = findEventIndex(seq);
        if (idx > -1) {
          const targetEvent = seq.events[idx];
          const durationToErase = targetEvent.end - targetEvent.start;
          const targetId = targetEvent.id;
          
          // Remove the clip
          seq.events.splice(idx, 1);
          
          // Collapse the void! Find all clips of the SAME character/track 
          // that happen AFTER this clip, and drag them backward in time.
          seq.events.forEach(e => {
            if (e.id === targetId && e.start >= targetEvent.end) {
              e.start -= durationToErase;
              e.end -= durationToErase;
            }
          });
          
          state.set('activeSequence', { ...seq });
          if (app.timeline) app.timeline.refreshTracks();
          console.log('B"H - The void was collapsed (Ripple Delete).');
        }
      },
      
      'split_clip': () => {
        const seq = state.get('activeSequence');
        const idx = findEventIndex(seq);
        if (idx > -1) {
          const original = seq.events[idx];
          // Cleave the event precisely in half
          const midPoint = original.start + (original.end - original.start) / 2;
          
          const firstHalf = { ...original, end: midPoint };
          const secondHalf = JSON.parse(JSON.stringify(original));
          secondHalf.start = midPoint;
          
          seq.events.splice(idx, 1, firstHalf, secondHalf);
          state.set('activeSequence', { ...seq });
          if (app.timeline) app.timeline.refreshTracks();
          console.log('B"H - The spark of time was cleaved in twain.');
        }
      },

      'duplicate_clip': () => {
        const seq = state.get('activeSequence');
        const idx = findEventIndex(seq);
        if (idx > -1) {
          const original = seq.events[idx];
          const duration = original.end - original.start;
          
          const clone = JSON.parse(JSON.stringify(original));
          clone.start = original.end;
          clone.end = original.end + duration;
          
          seq.events.push(clone);
          state.set('activeSequence', { ...seq });
          if (app.timeline) app.timeline.refreshTracks();
          console.log('B"H - The spark was echoed into the future.');
        }
      }
    };

    if (ActionRouter[actionKey]) ActionRouter[actionKey]();
    
    // Always hide menu after executing an action
    ContextMenuManager.hide();
  }
}