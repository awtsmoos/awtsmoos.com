// B"H
/** Texture binder: grass and dirt maps share a small WebGL altar. */
export class MaterialTextureBinder {
  constructor(gl) { this.gl = gl; this.cache = new WeakMap(); this.defaultTexture = createDefaultTexture(gl); this.aniso = gl.getExtension('EXT_texture_filter_anisotropic') || gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic'); }
  bind(loc, material, stats) {
    const gl = this.gl, map = imageReady(material?.mapImage), mix = imageReady(material?.mixImage);
    bindOne(gl, 1, loc.map, map ? this.textureFor(material.mapImage, material) : this.defaultTexture); gl.uniform1i(loc.useMap, map ? 1 : 0);
    gl.uniform2f(loc.mapRepeat, ...(material?.mapRepeat || [1, 1]));
    bindOne(gl, 2, loc.mixMap, mix ? this.textureFor(material.mixImage, material) : this.defaultTexture); gl.uniform1i(loc.useMixMap, mix ? 1 : 0);
    gl.uniform2f(loc.mixRepeat, ...(material?.mixRepeat || [1, 1])); gl.uniform1f(loc.mixStrength, material?.mixStrength ?? 0);
    if (map) { stats.texturedMeshes = (stats.texturedMeshes || 0) + 1; stats.textureUrl = material?.textureUrl || material.mapImage.src; stats.textureSize = `${material.mapImage.naturalWidth}x${material.mapImage.naturalHeight}`; }
    if (mix) { stats.mixedTerrain = true; stats.mixTextureUrl = material?.mixTextureUrl || material.mixImage.src; stats.mixTextureSize = `${material.mixImage.naturalWidth}x${material.mixImage.naturalHeight}`; }
  }
  textureFor(image, material) { if (this.cache.has(image)) return this.cache.get(image); const gl = this.gl, texture = gl.createTexture(), pot = isPot(image.naturalWidth) && isPot(image.naturalHeight); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texture); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image); if (pot) { gl.generateMipmap(gl.TEXTURE_2D); setParams(gl, gl.LINEAR_MIPMAP_LINEAR, gl.LINEAR, gl.REPEAT); } else setParams(gl, gl.LINEAR, gl.LINEAR, gl.CLAMP_TO_EDGE); if (this.aniso && material?.anisotropy !== false) gl.texParameterf(gl.TEXTURE_2D, this.aniso.TEXTURE_MAX_ANISOTROPY_EXT, 4); this.cache.set(image, texture); return texture; }
}
function bindOne(gl, unit, uniform, texture) { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, texture); if (uniform) gl.uniform1i(uniform, unit); }
function imageReady(image) { return !!(image && image.complete && image.naturalWidth); }
function createDefaultTexture(gl) { const texture = gl.createTexture(); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texture); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255])); setParams(gl, gl.NEAREST, gl.NEAREST, gl.CLAMP_TO_EDGE); return texture; }
function setParams(gl, min, mag, wrap) { gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, min); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, mag); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap); }
function isPot(n) { return n > 0 && (n & (n - 1)) === 0; }
