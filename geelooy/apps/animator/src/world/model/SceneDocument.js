// B"H
/** Serializable authored scene document. */
export class SceneDocument {
  constructor({ id, title, world, camera = {}, timeline = {}, version = 1 } = {}) {
    this.id = id; this.title = title; this.world = world; this.camera = camera; this.timeline = timeline; this.version = version;
  }
  toJSON() { return { id: this.id, title: this.title, version: this.version, world: this.world?.toJSON?.() || this.world, camera: this.camera, timeline: this.timeline }; }
}
