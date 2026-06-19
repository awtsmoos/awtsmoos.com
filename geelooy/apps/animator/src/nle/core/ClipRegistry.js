
/* B”H */

/**
 * @class ClipRegistry
 * @description
 * The 'Sefer HaZikaron' (Book of Remembrance). 
 * This class tracks every manifest clip in the timeline, 
 * mapping physical DOM nodes to their spiritual data equivalents in the 
 * active sequence.
 */
export class ClipRegistry {
  constructor() {
    this.clips = new Map(); // Map<Element, EventObject>
  }

  register(element, event) {
    this.clips.set(element, event);
  }

  getEvent(element) {
    return this.clips.get(element);
  }

  clear() {
    this.clips.clear();
  }
}
