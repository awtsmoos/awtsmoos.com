// B"H
export class TransformModifiers {
  static scale(item = {}, value = 1) { return { ...item, scale: (item.scale || 1) * value }; }
  static mirror(item = {}) { return { ...item, scale: -(item.scale || 1) }; }
  static offset(item = {}, dx = 0, dy = 0) { return { ...item, x: (item.x || 0) + dx, y: (item.y || 0) + dy }; }
  static rotate(item = {}, degrees = 0) { return { ...item, rotation: (item.rotation || 0) + degrees }; }
}
