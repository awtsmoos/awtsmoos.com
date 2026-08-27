/* B”H */
// Vector Path Utility for Flash-like shape morphing
export class Path {
  constructor(points = []) {
    this.points = points; // Array of {x, y, c1x, c1y, c2x, c2y, type: 'move'|'line'|'bezier'}
  }

  moveTo(x, y) {
    this.points.push({ x, y, type: 'move' });
  }

  lineTo(x, y) {
    this.points.push({ x, y, type: 'line' });
  }

  bezierCurveTo(c1x, c1y, c2x, c2y, x, y) {
    this.points.push({ x, y, c1x, c1y, c2x, c2y, type: 'bezier' });
  }

  static lerp(p1, p2, t) {
    return {
      x: p1.x + (p2.x - p1.x) * t,
      y: p1.y + (p2.y - p1.y) * t,
      c1x: p1.c1x !== undefined ? p1.c1x + (p2.c1x - p1.c1x) * t : undefined,
      c1y: p1.c1y !== undefined ? p1.c1y + (p2.c1y - p1.c1y) * t : undefined,
      c2x: p1.c2x !== undefined ? p1.c2x + (p2.c2x - p1.c2x) * t : undefined,
      c2y: p1.c2y !== undefined ? p1.c2y + (p2.c2y - p1.c2y) * t : undefined,
      type: p1.type
    };
  }

  static interpolate(path1, path2, t) {
    if (path1.points.length !== path2.points.length) {
      console.warn('Path interpolation requires same number of points');
      return path1;
    }
    const newPoints = path1.points.map((p, i) => this.lerp(p, path2.points[i], t));
    return new Path(newPoints);
  }

  draw(ctx) {
    ctx.beginPath();
    this.points.forEach(p => {
      if (p.type === 'move') ctx.moveTo(p.x, p.y);
      else if (p.type === 'line') ctx.lineTo(p.x, p.y);
      else if (p.type === 'bezier') ctx.bezierCurveTo(p.c1x, p.c1y, p.c2x, p.c2y, p.x, p.y);
    });
  }
}
