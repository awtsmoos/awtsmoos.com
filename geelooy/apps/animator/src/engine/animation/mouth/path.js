// B”H
// Advanced Mouth Path - The voice of the Awtsmoos speaking through the void.

export class MouthPath {
  static getPath(mouthType, openAmount, expression = 'neutral') {
    // Returns a set of points/curves for the mouth
    const centerX = 300;
    const centerY = 310;
    
    if (openAmount > 0.05) {
      const h = 2 + (openAmount * 30);
      const w = 15 + (openAmount * 15);
      return {
        type: 'ellipse',
        x: centerX,
        y: centerY,
        w,
        h,
        teeth: openAmount > 0.4,
        tongue: openAmount > 0.7
      };
    }
    
    return {
      type: 'line',
      points: [
        { x: centerX - 20, y: centerY },
        { cx: centerX, cy: centerY + 5, x: centerX + 20, y: centerY }
      ]
    };
  }
}
