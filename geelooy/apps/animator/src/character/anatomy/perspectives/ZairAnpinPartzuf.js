
// B"H
import { BasePartzuf } from './BasePartzuf.js';

/**
 * @class ZairAnpinPartzuf
 * @extends BasePartzuf
 * @description
 * THE SMALL COUNTENANCE (Zeir Anpin / 3/4 View).
 * B"H
 * 
 * RECTIFICATION OF SPACING & MIRRORING:
 * Hardcoded X offsets caused overlapping abominations when `flipX` was true. 
 * Every X coordinate must be multiplied by `this.dir` to respect the mirror!
 */
export class ZairAnpinPartzuf extends BasePartzuf {
  get type() { return 'threeQuarter'; }

  get head() { return { x: 8 * this.dir }; } 
  get body() { return { scaleX: 0.82 }; }
  
  get eyes() { 
    return { 
      visible: ['left', 'right'], 
      // Far eye pushed into the skull
      left: { x: -28 * this.dir, scaleX: 0.45 }, 
      // Near eye centered on the turned plane
      right: { x: 12 * this.dir, scaleX: 0.95 } 
    }; 
  }
  
  get eyebrows() { 
    return { 
      visible: ['left', 'right'], 
      left: { x: -28 * this.dir, scaleX: 0.45 }, 
      right: { x: 12 * this.dir, scaleX: 0.95 } 
    }; 
  }
  
  get nose() { return { x: 14 * this.dir }; }
  get mouth() { return { x: 18 * this.dir, scaleX: 0.75 }; }
  get beard() { return { x: 10 * this.dir, scaleX: 0.82 }; }
  
  // B"H - EARS: In 3/4 view, only the back ear is visible. 
  // If facing right (dir=1), the left ear is visible at -55.
  // If facing left (dir=-1), the right ear is visible at +55.
  get ears() { 
    if (this.dir === 1) {
        return { visible: ['left'], left: { x: -55 } }; 
    } else {
        return { visible: ['right'], right: { x: 55 } }; 
    }
  }

  get legs() { return { spread: 14 }; }
  get arms() { return { spread: 42, dirLeft: -0.5, dirRight: 1 }; } 
  get feet() { return { angleLeft: 12, angleRight: 12, dirLeft: 1, dirRight: 1 }; }
}
