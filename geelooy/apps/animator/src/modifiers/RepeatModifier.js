// B"H
export class RepeatModifier {
  static apply(item = {}, { count = 1, dx = 0, dy = 0 } = {}) {
    return Array.from({ length: count }, (_, i) => ({ ...item, id: `${item.id}_${i}`, x: (item.x || 0) + dx * i, y: (item.y || 0) + dy * i }));
  }
}
