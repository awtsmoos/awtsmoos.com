
/* B”H */
import { EventSanitizer } from './EventSanitizer.js';

/**
 * @class EventGrouper
 * @description
 * THE GATHERER OF SPARKS (Birur Nitzotzot).
 * This divine mechanism performs 'Tikkun' (Rectification). It iterates over the 
 * infinite sparks (events), purifies them via EventSanitizer, and sorts them 
 * into their appropriate 'Partzufim' (Personas).
 * 
 * We have reinforced this vessel to withstand any amount of chaotic JSON data,
 * guaranteeing it never returns `undefined` or `null` to the TrackGroupUI.
 */
export class EventGrouper {
  /**
   * Sorts the raw array of timeline events into a deeply nested, track-ready structure.
   * 
   * @param {Object} sequence - The raw JSON sequence containing the flat `.events` array.
   * @returns {Object} The deeply structured, infinitely safe hierarchy of track data.
   */
  static group(sequence) {
    const groups = { 
      GLOBAL: { CAMERA: [], PROPS: [], SCENE: [] } 
    };

    if (!sequence || !Array.isArray(sequence.events)) {
      return groups; // Return the empty void, safely structured.
    }

    sequence.events.forEach(rawEvent => {
      const event = EventSanitizer.sanitize(rawEvent);

      if (event.type === 'camera') {
        groups.GLOBAL.CAMERA.push(event);
      } else if (event.type === 'prop') {
        groups.GLOBAL.PROPS.push(event);
      } else if (event.type === 'scene') {
        groups.GLOBAL.SCENE.push(event);
      } else if (event.type === 'character' || event.type === 'speech') {
        const id = event.id;
        
        if (!groups[id]) {
          groups[id] = { MOTION: [], SPEECH: [], ANIMATION: [] };
        }
        
        if (event.speech || event.type === 'speech') {
          groups[id].SPEECH.push(event);
        } else if (event.actions && event.actions.length > 0) {
          groups[id].ANIMATION.push(event);
        } else {
          groups[id].MOTION.push(event);
        }
      }
    });

    return groups;
  }
}
