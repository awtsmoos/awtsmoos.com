// B"H
export class TargetListNormalizer {
  static normalize(...values) {
    const seen = new Set();
    const clean = [];
    for (const value of values.flat(Infinity).filter(Boolean)) {
      const item = typeof value === 'string' ? { id: value } : value;
      const key = item.id ? `id:${item.id}` : item.type === 'point' ? `point:${item.x}:${item.y}` : JSON.stringify(item);
      if ((item.id || item.type === 'point') && !seen.has(key)) { seen.add(key); clean.push(item); }
    }
    return clean;
  }
}
