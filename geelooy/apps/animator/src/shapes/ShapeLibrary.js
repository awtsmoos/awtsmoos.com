// B"H
import { ShapeNodeFactory as S } from './ShapeNodeFactory.js';
/** Declarative shapes used by assets and groups. */
export class ShapeLibrary {
  static from(spec = {}) {
    if (spec.type === 'circle') return S.circle(spec.id, spec);
    if (spec.type === 'ellipse') return S.ellipse(spec.id, spec);
    if (spec.type === 'path') return S.path(spec.id, spec.points || [], spec);
    if (spec.type === 'text') return S.text(spec.id, spec);
    if (spec.type === 'group') return S.group(spec.id, (spec.children || []).map(c => this.from(c)), spec.transform || null);
    return S.rect(spec.id, spec);
  }
}
