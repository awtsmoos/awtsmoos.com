
/* B”H */

/**
 * @class VerletSystem
 * @description
 * The Physics of 'Asiyah' (Action/Physicality). 
 * Implements secondary motion using a mass-spring constraint system. 
 * This breathes life into the Beard and Hat Pom-Poms, making them lag, 
 * bounce, and ripple as if they were actually affected by the 
 * character's movement inertia.
 */
export class VerletSystem {
  constructor(points = [], gravity = 0.5) {
    this.points = points.map(p => ({
      x: p.x, y: p.y, oldX: p.x, oldY: p.y, pinned: p.pinned || false
    }));
    this.constraints = [];
    this.gravity = gravity;
  }

  addConstraint(p1Idx, p2Idx, length) {
    this.constraints.push({ p1: p1Idx, p2: p2Idx, length });
  }

  update(anchorX, anchorY) {
    // Pin first point to anchor
    if (this.points[0]) {
      // B"H - First frame teleportation to avoid extreme rubber-banding
      if (this.points[0].oldX === 0 && this.points[0].oldY === 0 && anchorX !== 0) {
        const diffX = anchorX - this.points[0].x;
        const diffY = anchorY - this.points[0].y;
        this.points.forEach(p => {
          p.x += diffX;
          p.y += diffY;
          p.oldX = p.x;
          p.oldY = p.y;
        });
      }
      this.points[0].x = anchorX;
      this.points[0].y = anchorY;
      this.points[0].oldX = anchorX;
      this.points[0].oldY = anchorY;
    }

    this.points.forEach(p => {
      if (!p.pinned) {
        // B"H - Friction (0.9) dampens the swing, preventing infinite chaos
        const vx = (p.x - p.oldX) * 0.9;
        const vy = (p.y - p.oldY) * 0.9;
        p.oldX = p.x;
        p.oldY = p.y;
        p.x += vx;
        p.y += vy + this.gravity;
      }
    });

    for (let i = 0; i < 5; i++) { // Solver iterations
      this.constraints.forEach(c => {
        const p1 = this.points[c.p1];
        const p2 = this.points[c.p2];
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const diff = (c.length - dist) / dist;
        const offsetX = dx * diff * 0.5;
        const offsetY = dy * diff * 0.5;

        if (!p1.pinned) { p1.x -= offsetX; p1.y -= offsetY; }
        if (!p2.pinned) { p2.x += offsetX; p2.y += offsetY; }
      });
    }
  }
}
