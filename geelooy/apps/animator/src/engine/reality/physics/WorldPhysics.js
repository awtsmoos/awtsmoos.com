
// B"H
/**
 * @file WorldPhysics.js
 * @brief THE BREATH AND MASS OF THE WORLD (Ruach v'Koved HaOlam).
 * 
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 8: THE UNSEEN FORCES
 * ═══════════════════════════════════════════════════════════════
 * Applies Wind to the foliage and Gravity to thrown objects!
 * Any prop with a `velocity` matrix will fly across the screen, 
 * rotate wildly, and bounce upon striking the earth.
 * 
 * @class WorldPhysics
 */
export class WorldPhysics {
  static getWindForce(x, time) {
    const primary = Math.sin(time * 0.001 + x * 0.01) * 5;
    const secondary = Math.sin(time * 0.003 - x * 0.02) * 2;
    const gust = Math.max(0, Math.sin(time * 0.0005) - 0.7) * 20; 
    return primary + secondary + (gust * Math.sin(time * 0.01));
  }

  /**
   * Processes ballistic trajectories for all detached props.
   */
  static processPropPhysics(scene, groundY) {
    if (!scene || !scene.props) return;

    scene.props.forEach(prop => {
      // If it is held by someone, it defies local gravity (inherits parent)
      if (prop.parentId) return;

      if (prop.velocity && (Math.abs(prop.velocity.x) > 0.1 || Math.abs(prop.velocity.y) > 0.1)) {
        // Gravity
        prop.velocity.y += 0.8; 
        
        // Air friction
        prop.velocity.x *= 0.98;

        prop.x = (prop.x || 0) + prop.velocity.x;
        prop.y = (prop.y || 0) + prop.velocity.y;

        // Rotation
        if (prop.angularVelocity) {
            prop.rotation = (prop.rotation || 0) + prop.angularVelocity;
            prop.angularVelocity *= 0.98; 
        }

        // Earth Collision
        if (prop.y >= groundY) {
            prop.y = groundY;
            prop.velocity.y *= -0.4; // Bounce dampening
            prop.velocity.x *= 0.7;  // Ground friction
            
            // Stop micro-bouncing
            if (Math.abs(prop.velocity.y) < 1.0) prop.velocity.y = 0;
            if (Math.abs(prop.velocity.x) < 0.1) prop.velocity.x = 0;
        }
      }
    });
  }
}
