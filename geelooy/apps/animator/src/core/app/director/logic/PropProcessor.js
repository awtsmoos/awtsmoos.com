// B"H
import { ObjectLifecycleEngine } from '../../../../objects/ObjectLifecycleEngine.js';

/** Object lifecycle prop motion: grounded, contact-solved, animation-friendly. */
export class PropProcessor {
  static process(state, event = {}, t = 0) {
    const raw = state.get('props') || {};
    const map = this.toMap(raw);
    const current = map[event.id] || this.fresh(event);
    map[event.id] = ObjectLifecycleEngine.advance(current, event, this.ease(t));
    state.set('props', Array.isArray(raw) ? Object.values(map) : map, true);
  }

  static fresh(event = {}) { return { id: event.id, type: event.propType || event.type || 'box', size: event.size || 14, color: event.color, visible: true, layer: event.layer || 'front', lifecycle: event.lifecycle || 'introduced' }; }
  static toMap(raw) { return Array.isArray(raw) ? raw.reduce((o, p) => (p?.id && (o[p.id] = p), o), {}) : { ...raw }; }
  static ease(t) { const x = Math.max(0, Math.min(1, Number(t) || 0)); return x * x * (3 - 2 * x); }
}
