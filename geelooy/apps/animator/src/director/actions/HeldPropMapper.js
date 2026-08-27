// B"H

export class HeldPropMapper {
  static attach(prop = {}, characters = {}) {
    const holder = characters[prop.holderId];
    if (!holder) return prop;
    const pos = holder.position || {};
    return { ...prop, x: Number(pos.x || 0) + 28, y: Number(pos.y || 0) - 84, layer: 'front' };
  }
}
