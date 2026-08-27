// B"H
/** A group is the vessel where assets gather into meaning. */
export class Group {
  constructor({ id, children = [], modifiers = [], x = 0, y = 0, props = {} } = {}) {
    this.kind = 'group'; this.id = id; this.children = children; this.modifiers = modifiers;
    this.x = x; this.y = y; this.props = props;
  }
  add(child) { this.children.push(child); return this; }
  toJSON() { return { ...this, children: this.children.map(c => c.toJSON?.() || c) }; }
}
