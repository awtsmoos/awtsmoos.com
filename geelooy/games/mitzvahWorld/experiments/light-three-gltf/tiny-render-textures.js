// B"H
/** Texture binder: grass receives color; untextured meshes receive silence, safely. */
export class MaterialTextureBinder {
  constructor(gl) {
    this.gl = gl;
    this.cache = new WeakMap();
    this.defaultTexture = createDefaultTexture(gl);
  }

  bind(loc, material, stats) {
    const gl = this.gl;
    const image = material?.mapImage;
    const ready = !!(image && image.complete && image.naturalWidth);
    const texture = ready ? this.textureFor(image) : this.defaultTexture;
    const repeat = material?.mapRepeat || [1, 1];

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(loc.map, 1);
    gl.uniform1i(loc.useMap, ready ? 1 : 0);
    gl.uniform2f(loc.mapRepeat, repeat[0] || 1, repeat[1] || 1);

    if (ready) stats.texturedMeshes = (stats.texturedMeshes || 0) + 1;
  }

  textureFor(image) {
    if (this.cache.has(image)) return this.cache.get(image);
    const gl = this.gl;
    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    setTextureParams(gl, gl.LINEAR, gl.LINEAR);
    this.cache.set(image, texture);
    return texture;
  }
}

function createDefaultTexture(gl) {
  const texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
  setTextureParams(gl, gl.NEAREST, gl.NEAREST);
  return texture;
}

function setTextureParams(gl, min, mag) {
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, min);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, mag);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
}
