// B"H

/**
 * @file BubbleCollisionAvoider.js
 * @description
 * Moves speech bubbles away from face/torso invisible safety rectangles.
 */
export class BubbleCollisionAvoider {
  /**
   * Avoids collision.
   *
   * @param {Object} rect - Bubble rect.
   * @param {Object} anchors - Anchors.
   * @returns {Object} Adjusted rect.
   */
  static avoid(rect, anchors) {
    let out = { ...rect };
    const danger = [
      this.toRect(anchors.head),
      this.toRect(anchors.torso)
    ];

    danger.forEach(zone => {
      if (this.intersects(out, zone)) {
        out.y = zone.y - out.h - 18 * anchors.scale;
      }
    });

    if (out.y < -382) {
      out.x += anchors.root.x < 0 ? 96 * anchors.scale : -96 * anchors.scale;
      out.y = anchors.head.y - out.h * 0.42;
    }

    return out;
  }

  /**
   * Makes rect from center zone.
   *
   * @param {Object} z - Zone.
   * @returns {Object} Rect.
   */
  static toRect(z) {
    return {
      x: z.x - z.w * 0.5,
      y: z.y - z.h * 0.5,
      w: z.w,
      h: z.h
    };
  }

  /**
   * Intersects.
   *
   * @param {Object} a - A.
   * @param {Object} b - B.
   * @returns {boolean} Intersecting.
   */
  static intersects(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }
}