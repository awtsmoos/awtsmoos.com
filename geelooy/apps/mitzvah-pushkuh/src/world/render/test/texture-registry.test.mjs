// B"H
import assert from "node:assert/strict";
import { createTextureRegistry } from "../gl/texture-registry.js";

let created = 0, binds = 0;
const gl = {
  TEXTURE_2D: 1, UNPACK_PREMULTIPLY_ALPHA_WEBGL: 2, CLAMP_TO_EDGE: 3, LINEAR: 4, RGBA: 5, UNSIGNED_BYTE: 6,
  TEXTURE_WRAP_S: 7, TEXTURE_WRAP_T: 8, TEXTURE_MIN_FILTER: 9, TEXTURE_MAG_FILTER: 10,
  createTexture: () => ({ id: ++created }), bindTexture: () => binds++, pixelStorei() {}, texParameteri() {}, texImage2D() {}
};
const registry = createTextureRegistry(gl), img = { width: 16, height: 16 };
const a = registry.register("a", img, { uv: { u0: 0, v0: 0, u1: .5, v1: .5 } });
const b = registry.register("b", img, { uv: { u0: .5, v0: .5, u1: 1, v1: 1 } });
assert.equal(a.texture, b.texture);
assert.notDeepEqual(a.uv, b.uv);
registry.bind(a); registry.bind(b);
assert.equal(registry.stats().uploads, 1);
assert.equal(binds, 1);
console.log("texture registry ok");
