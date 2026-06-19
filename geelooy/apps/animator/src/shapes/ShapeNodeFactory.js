// B"H
import { VirtualGraph as G } from '../engine/graph/VirtualGraph.js';
/** Single doorway from authored shapes into graph nodes. */
export class ShapeNodeFactory {
  static rect(id, p = {}) { return G.rect(id, p); }
  static circle(id, p = {}) { return G.circle(id, p.x || 0, p.y || 0, p.radius || 10, this.style(p)); }
  static ellipse(id, p = {}) { return G.ellipse(id, p.x || 0, p.y || 0, p.radiusX || 10, p.radiusY || 6, p.rotation || 0, this.style(p)); }
  static path(id, points = [], p = {}) { return G.path(id, points, this.style(p)); }
  static text(id, p = {}) { return G.text(id, p.text || '', p.x || 0, p.y || 0, this.style(p)); }
  static group(id, children = [], transform = null) { return G.group(id, transform, children); }
  static style(p = {}) { return { fill: p.fill, stroke: p.stroke, lineWidth: p.lineWidth, font: p.font }; }
}
