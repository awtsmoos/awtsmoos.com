
/* B”H */

/**
 * @class Joint
 * @description
 * A single 'Perek' (Joint) in the Kinematic chain. 
 * Represents a point of pivot and rotation. It handles the local-to-world 
 * transformation logic for limbs, ensuring that when the shoulder rotates, 
 * the elbow and wrist follow in perfect sequence.
 */
export class Joint {
  constructor(name, x, y, parent = null) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.parent = parent;
    this.rotation = 0; // Degrees
    this.length = 0;
  }

  getWorldTransform(ctx) {
    if (this.parent) {
      this.parent.getWorldTransform(ctx);
      ctx.translate(0, this.parent.length);
    } else {
      ctx.translate(this.x, this.y);
    }
    ctx.rotate(this.rotation * Math.PI / 180);
  }
}
