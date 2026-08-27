
/* B"H */
import { VerletSystem } from '../../../../character/physics/VerletSystem.js';

/**
 * @class PhysicsState
 * @description
 * Persists the physical state (Verlet points) for each character. 
 * Since the animation loop is stateless, we store the 'Sparks' 
 * of momentum here so they carry over between frames.
 */
export class PhysicsState {
  static registry = new Map();

  static get(id, type, nodeCount = 3, restLength = 15) {
    const key = `${id}_${type}`;
    if (!this.registry.has(key)) {
      const initialPoints = [];
      for (let i = 0; i < nodeCount; i++) {
         initialPoints.push({ x: 0, y: i * restLength, pinned: i === 0 });
      }
      const gravity = type === 'hair' ? 0.2 : 0.6; 
      const sys = new VerletSystem(initialPoints, gravity);
      
      for (let i = 0; i < nodeCount - 1; i++) {
        sys.addConstraint(i, i + 1, restLength);
      }
      
      this.registry.set(key, sys);
    }
    return this.registry.get(key);
  }
}
