// B"H
/** Authored asset instance: no procedural mystery, only named intent. */
export class Asset {
  constructor({ id, assetId, x = 0, y = 0, scale = 1, rotation = 0, props = {} } = {}) {
    this.kind = 'asset'; this.id = id || assetId; this.assetId = assetId || id;
    this.x = x; this.y = y; this.scale = scale; this.rotation = rotation; this.props = props;
  }
  toJSON() { return { ...this }; }
}
