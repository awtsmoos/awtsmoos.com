
/* B”H */

/**
 * @class EventGrouper
 * @description
 * THE GATHERER OF SPARKS (Birur Nitzotzot).
 * The raw sequence JSON exists in a state of 'Tohu' (Chaos)—a flat array where 
 * cameras, characters, and props are all mixed together without hierarchy.
 * 
 * This divine mechanism performs 'Tikkun' (Rectification). It iterates over the 
 * infinite sparks (events) and sorts them into their appropriate 'Partzufim' (Personas).
 * 
 * - GLOBAL sparks (Camera, Props) are routed to the Keter/Chokhmah tracks.
 * - CHARACTER sparks are grouped by their specific ID (C1, C2).
 * - Within characters, events are split between SPEECH (Malchut) and MOTION (Netzach/Hod).
 */
export class EventGrouper {
  /**
   * Sorts the raw array of timeline events into a deeply nested, track-ready structure.
   * 
   * @param {Object} sequence - The raw JSON sequence containing the flat `.events` array.
   * @returns {Object} The deeply structured hierarchy of track data.
   */
  static group(sequence) {
    // If the sequence is empty, return an empty void ready for creation.
    if (!sequence || !Array.isArray(sequence.events)) {
      return { GLOBAL: { CAMERA: [], PROPS: [] } };
    }

    // Initialize the fundamental structure of the universe.
    const groups = { 
      GLOBAL: { 
        CAMERA: [], 
        PROPS: [] 
      } 
    };

    // Iterate over every spark of action in the sequence.
    sequence.events.forEach(event => {
      // Route Global Camera Events
      if (event.type === 'camera') {
        groups.GLOBAL.CAMERA.push(event);
      } 
      // Route Global Prop Events
      else if (event.type === 'prop') {
        groups.GLOBAL.PROPS.push(event);
      } 
      // Route Specific Character Entities
      else if (event.type === 'character' || event.type === 'speech') {
        const id = event.id || 'unknown_soul';
        
        // If this character has not yet been registered, create their track vessels
        if (!groups[id]) {
          groups[id] = { 
            MOTION: [], 
            SPEECH: [] 
          };
        }
        
        // Split the character's actions into Speech (Voice) vs Motion (Body)
        if (event.speech || event.type === 'speech') {
          groups[id].SPEECH.push(event);
        } else {
          groups[id].MOTION.push(event);
        }
      }
    });

    return groups;
  }
}
