// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { ContactShadowSystem } from '../../../objects/art/ContactShadowSystem.js';
import { BiteMarkSystem } from '../../../objects/art/BiteMarkSystem.js';
import { ObjectSquashStretch } from '../../../objects/art/ObjectSquashStretch.js';
import { ProductionPropLibrary } from './production/ProductionPropLibrary.js';

/** Production prop bridge with old fallbacks preserved. */
export class PropBuilder {
  static buildAll(props = [], layer = 'front') {
    return this.list(props).filter(p => p && p.visible !== false)
      .filter(p => (p.layer || 'front') === layer).map(p => this.build(p)).filter(Boolean);
  }

  static list(props) { return Array.isArray(props) ? props : Object.values(props || {}); }

  static build(prop = {}) {
    const p = BiteMarkSystem.apply(prop);
    const prod = ProductionPropLibrary.build(p);
    const type = p.type || p.propType || 'box';
    const fallback = {
      box: () => this.box(p), ball: () => this.ball(p), apple: () => this.apple(p),
      carrot: () => this.carrot(p), sandwich: () => this.sandwich(p), plate: () => this.plate(p),
      lunchbox: () => this.lunchbox(p), book: () => this.book(p), cup: () => this.cup(p),
      soup: () => this.soup(p), sparkle: () => this.sparkle(p)
    };
    return this.withTransform(p, prod || (fallback[type]?.() || this.box(p)));
  }

  static withTransform(p, node) {
    const s = ObjectSquashStretch.scale(p);
    return G.group(`prop_${this.id(p)}_rendered`, { ...this.tx(p), scaleX: s.scaleX, scaleY: s.scaleY }, [this.shadow(p), node]);
  }

  static shadow(p) {
    const s = ContactShadowSystem.for(p);
    return G.ellipse(s.id, 0, (p.size || 14) * 0.7, s.radiusX, s.radiusY, 0, this.style('rgba(0,0,0,.2)'));
  }

  static book(p) { return ProductionPropLibrary.build({ ...p, type: 'book' }) || this.box(p); }
  static soup(p) { return ProductionPropLibrary.build({ ...p, type: 'soup' }) || this.plate(p); }
  static cup(p) { return ProductionPropLibrary.build({ ...p, type: 'cup' }) || this.box(p); }
  static plate(p) { return ProductionPropLibrary.build({ ...p, type: 'plate' }) || this.box(p); }
  static sandwich(p) { return ProductionPropLibrary.build({ ...p, type: 'plate' }) || this.box(p); }

  static apple(p) {
    const r = p.size || 18;
    return G.group(`prop_apple_${this.id(p)}`, null, [
      G.circle('body', 0, 0, r, this.style('#df3e35', '#58120e', 2.4)),
      p.biteMark ? G.circle('bite_mark', r * 0.56, -r * 0.3, r * 0.28, this.style('#f9dfae', '#58120e', 1.4)) : null,
      G.ellipse('highlight', -r * 0.35, -r * 0.35, r * 0.22, r * 0.12, -25, this.style('rgba(255,255,255,.38)')),
      G.rect('stem', { x: -2, y: -r - 8, width: 4, height: 10, fill: '#5d3518' }),
      G.ellipse('leaf', 8, -r - 5, 8, 4, -20, this.style('#59a84d'))
    ]);
  }

  static carrot(p) {
    const s = p.size || 24;
    return G.group(`prop_carrot_${this.id(p)}`, null, [
      G.path('body', [{ type: 'move', x: -s * 0.65, y: -s * 0.24 }, { type: 'line', x: s * 0.75, y: 0 }, { type: 'line', x: -s * 0.65, y: s * 0.24 }, { type: 'line', x: -s * 0.65, y: -s * 0.24 }], this.style('#f28c28', '#6b310d', 2.4)),
      G.rect('leaf_a', { x: -s * 0.9, y: -s * 0.36, width: 12, height: 7, fill: '#2f8a3e' }),
      G.rect('leaf_b', { x: -s * 0.9, y: 2, width: 14, height: 7, fill: '#42a64f' })
    ]);
  }

  static lunchbox(p) {
    const s = p.size || 42;
    return G.group(`prop_lunchbox_${this.id(p)}`, null, [
      G.rect('body', { x: -s * 0.7, y: -s * 0.45, width: s * 1.4, height: s * 0.9, fill: p.color || '#ef5a4e', stroke: '#5b1b18', lineWidth: 2.2 }),
      G.rect('handle', { x: -s * 0.35, y: -s * 0.65, width: s * 0.7, height: 7, fill: '#ffd36b' })
    ]);
  }

  static ball(p) {
    const r = p.size || 16;
    return G.group(`prop_ball_${this.id(p)}`, null, [
      G.circle('body', 0, 0, r, this.style(p.color || '#ffd45a', '#5a4300', 2.4)),
      G.ellipse('shine', -r * 0.28, -r * 0.34, r * 0.22, r * 0.12, -20, this.style('rgba(255,255,255,.42)'))
    ]);
  }

  static sparkle(p) {
    const s = p.size || 12;
    return G.group(`prop_sparkle_${this.id(p)}`, null, Array.from({ length: 6 }, (_, i) => {
      const a = i * Math.PI / 3;
      return G.path(`ray_${i}`, [{ type: 'move', x: Math.cos(a) * s * 0.25, y: Math.sin(a) * s * 0.25 }, { type: 'line', x: Math.cos(a) * s, y: Math.sin(a) * s }], { stroke: '#fff176', lineWidth: 3 });
    }));
  }

  static box(p) {
    const s = p.size || 24;
    return G.group(`prop_box_${this.id(p)}`, null, [
      G.rect('body', { x: -s / 2, y: -s / 2, width: s, height: s, fill: p.color || '#b87934', stroke: '#2b1608', lineWidth: 2.4 }),
      G.rect('edge', { x: -s / 2 + 4, y: -s / 2 + 4, width: s - 8, height: 3, fill: 'rgba(255,255,255,.18)' })
    ]);
  }

  static tx(p) { return { x: Number(p.x ?? p.position?.x ?? 0), y: Number(p.y ?? p.position?.y ?? 0), rotation: Number(p.rotation || 0), scaleX: Number(p.scaleX || 1), scaleY: Number(p.scaleY || 1) }; }
  static id(p) { return p.id || p.name || 'anonymous'; }
  static style(fill, stroke, lineWidth) { return { fill, stroke, lineWidth }; }
}
