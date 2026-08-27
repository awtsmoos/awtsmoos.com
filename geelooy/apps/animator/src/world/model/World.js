// B"H
/** World owns districts; it does not invent them. */
export class World {
  constructor({ id = 'world', districts = [], props = {} } = {}) { this.kind = 'world'; this.id = id; this.districts = districts; this.props = props; }
  add(district) { this.districts.push(district); return this; }
  toJSON() { return { ...this, districts: this.districts.map(d => d.toJSON?.() || d) }; }
}
