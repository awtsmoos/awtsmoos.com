
/* B”H */

/**
 * @class InertiaEngine
 * @description
 * Implements the Physics of Persistence. 
 * Parts like the Beard and Hat Pom lag behind the movement of the anchor, 
 * simulating mass and resistance in the lower world of Asiyah.
 */
export class InertiaEngine {
  constructor() {
    this.states = new Map(); // Key: characterId_partName, Value: {x, vx}
  }

  /**
   * Calculates the lagged position of a secondary part.
   */
  getLaggedPosition(id, part, targetX, targetY, stiffness = 0.15, damping = 0.8) {
    const key = `${id}_${part}`;
    if (!this.states.has(key)) {
      this.states.set(key, { x: targetX, y: targetY, vx: 0, vy: 0 });
    }

    const s = this.states.get(key);
    
    // Physics Step (Spring-Mass-Damper)
    const ax = (targetX - s.x) * stiffness;
    const ay = (targetY - s.y) * stiffness;
    
    s.vx = (s.vx + ax) * damping;
    s.vy = (s.vy + ay) * damping;
    
    s.x += s.vx;
    s.y += s.vy;

    return { x: s.x, y: s.y };
  }
}
