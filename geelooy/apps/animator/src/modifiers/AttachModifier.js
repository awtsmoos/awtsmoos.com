// B"H
export class AttachModifier {
  static apply(item = {}, target = {}, offset = {}) { return { ...item, x: (target.x || 0) + (offset.x || 0), y: (target.y || 0) + (offset.y || 0), attachedTo: target.id }; }
}
