// B"H
/**
 * Textures are remembered sparks with counted footsteps.
 * One packed atlas texture can hold many named records, each with its own UV,
 * so many sprites share one GPU garment without losing their coordinates.
 */
export function createTextureRegistry(gl) {
  const textures = new WeakMap(), names = new Map();
  const stats = { uploads: 0, binds: 0 };
  let active = null;
  function get(image) {
    if (!image) return null;
    let record = textures.get(image);
    if (!record) { record = upload(image); textures.set(image, record); }
    return record;
  }
  function register(name, image, meta = {}) {
    const base = get(image);
    if (!base) return null;
    const record = { ...base, ...meta };
    names.set(name, record);
    return record;
  }
  function getNamed(name) { return names.get(name) || null; }
  function bind(record) {
    if (!record?.texture) return false;
    if (active !== record.texture) { gl.bindTexture(gl.TEXTURE_2D, record.texture); active = record.texture; stats.binds++; }
    return true;
  }
  function upload(image) {
    const texture = gl.createTexture(); active = texture; stats.uploads++;
    gl.bindTexture(gl.TEXTURE_2D, texture); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    return { texture, w: image.width || 1, h: image.height || 1, uv: FULL_UV };
  }
  return { get, register, getNamed, bind, stats: () => ({ ...stats }) };
}

const FULL_UV = Object.freeze({ u0: 0, v0: 0, u1: 1, v1: 1 });
