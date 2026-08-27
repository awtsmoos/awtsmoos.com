// B"H
import { LinearPath } from './LinearPath.js';
export class PathAttachment {
  static distribute(items = [], points = []) {
    const path = new LinearPath(points); const denom = Math.max(1, items.length - 1);
    return items.map((item, i) => ({ ...item, ...path.sample(i / denom) }));
  }
}
