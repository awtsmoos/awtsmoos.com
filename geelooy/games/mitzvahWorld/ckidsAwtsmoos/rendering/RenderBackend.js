// B"H
/** @file RenderBackend.js @description Abstract rendering vessel; domain code speaks here, not directly to Three. */
export class RenderBackend {
  constructor(name = "abstract") { this.name = name; }
  fail(method) { throw new Error(`B\"H RenderBackend.${method} is not implemented by ${this.name}`); }
  group() { this.fail("group"); }
  geometry() { this.fail("geometry"); }
  material() { this.fail("material"); }
  texture() { this.fail("texture"); }
  skeleton() { this.fail("skeleton"); }
  skinnedMesh() { this.fail("skinnedMesh"); }
  mesh() { this.fail("mesh"); }
  clip() { this.fail("clip"); }
  mixer() { this.fail("mixer"); }
  attach(parent, child) { if (parent && child && typeof parent.add === "function") parent.add(child); return child; }
  mark(object, data = {}) { if (!object) return object; if (!object.userData) object.userData = {}; Object.assign(object.userData, data); return object; }
  traverse(root, fn) { if (root && typeof root.traverse === "function") root.traverse(fn); return root; }
  dispose() {}
}
export default RenderBackend;
