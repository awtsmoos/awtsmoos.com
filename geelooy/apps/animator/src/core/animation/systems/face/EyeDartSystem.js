
// B"H
/**
 * @class EyeDartSystem
 * @description
 * THE SEEKING EYE (Ein Ro'eh).
 * B"H
 * 
 * RECTIFICATION (The Saccadic Hold):
 * Human eyes do not slide smoothly unless tracking a moving object. 
 * When scanning a room, they snap to a point, process the visual data 
 * (Hold), and then snap again. This is called a Saccade.
 * 
 * The previous engine jittered constantly. Now, we use integer division 
 * on the timeline to create distinct epochs (e.g., 1.5 second intervals). 
 * During that entire epoch, the seed remains identical, locking the 
 * pupil to an exact coordinate until the next cycle.
 */
export class EyeDartSystem {
  static getOffset(time, chanceThreshold = 0.4) {
    // A new focal point is chosen every 1200 milliseconds
    const dartInterval = 1200; 
    
    // Integer division ensures the seed stays identical for the whole interval!
    const epochSeed = Math.floor(time / dartInterval);
    
    // Deterministic randomizer
    const random = (s) => (Math.sin(s * 12.9898) * 43758.5453) % 1;
    
    const trigger = random(epochSeed);
    
    // If the mood dictates high erraticism, the threshold is lower, meaning more darts!
    if (trigger > (1.0 - chanceThreshold)) { 
        // Snap to a location and HOLD it for the entire 1200ms
        return { 
            x: (random(epochSeed + 1) - 0.5) * 7, 
            y: (random(epochSeed + 2) - 0.5) * 3  
        };
    }
    
    // 60% of the time, look straight ahead into the soul of the viewer
    return { x: 0, y: 0 };
  }
}
