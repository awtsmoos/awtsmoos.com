// B"H
import { RepeatModifier } from './RepeatModifier.js';
import { TransformModifiers } from './TransformModifiers.js';
/** Applies explicit modifiers in authored order. */
export class ModifierEngine {
  static apply(items = [], modifiers = []) {
    return modifiers.reduce((list, mod) => this.applyOne(list, mod), items);
  }
  static applyOne(list, mod = {}) {
    if (mod.type === 'repeat') return list.flatMap(item => RepeatModifier.apply(item, mod.options));
    if (mod.type === 'offset') return list.map(item => TransformModifiers.offset(item, mod.options?.dx, mod.options?.dy));
    if (mod.type === 'scale') return list.map(item => TransformModifiers.scale(item, mod.options?.value));
    return list;
  }
}
