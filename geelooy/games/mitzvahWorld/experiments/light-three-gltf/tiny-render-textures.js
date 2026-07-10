// B"H
/** Texture binder: original image upload, repeat uniforms, measured anisotropy. */
export class MaterialTextureBinder {
  constructor(gl) { this.gl = gl; this.cache = new WeakMap(); this.defaultTexture = createDefaultTexture(gl); this.aniso = gl.getExtension('EXT_texture_filter_anisotropic') || gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic'); }
  bind(loc, material, stats) {
    const gl = this.gl, map = sourceReady(material?.mapImage), mix = sourceReady(material?.mixImage);
    bindOne(gl, 1, loc.map, map ? this.textureFor(material.mapImage, material) : this.defaultTexture); gl.uniform1i(loc.useMap, map ? 1 : 0); gl.uniform2f(loc.mapRepeat, ...(material?.mapRepeat || [1, 1]));
    bindOne(gl, 2, loc.mixMap, mix ? this.textureFor(material.mixImage, material) : this.defaultTexture); gl.uniform1i(loc.useMixMap, mix ? 1 : 0); gl.uniform2f(loc.mixRepeat, ...(material?.mixRepeat || [1, 1])); gl.uniform1f(loc.mixStrength, material?.mixStrength ?? 0);
    this.statsFor(material, stats, map, mix);
  }
  textureFor(source, material) { if (this.cache.has(source)) return this.cache.get(source); const gl = this.gl, texture = gl.createTexture(), width = sourceWidth(source), height = sourceHeight(source), pot = isPot(width) && isPot(height); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texture); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source); if (pot) { gl.generateMipmap(gl.TEXTURE_2D); setParams(gl, gl.LINEAR_MIPMAP_LINEAR, gl.LINEAR, gl.REPEAT); } else setParams(gl, gl.LINEAR, gl.LINEAR, gl.CLAMP_TO_EDGE); this.applyAniso(material); this.cache.set(source, texture); return texture; }
  applyAniso(material) { if (!this.aniso || material?.anisotropy === false) return; const gl = this.gl, max = gl.getParameter(this.aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT) || 4, asked = material?.anisotropy === true ? 4 : Number(material?.anisotropy || 2); gl.texParameterf(gl.TEXTURE_2D, this.aniso.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(asked, max)); }
  statsFor(material, stats, map, mix) { if (map) { stats.texturedMeshes = (stats.texturedMeshes || 0) + 1; stats.textureUrl = material?.textureUrl || material.mapImage.src || material.mapImage.dataset?.url || 'generated-canvas'; stats.textureSize = `${sourceWidth(material.mapImage)}x${sourceHeight(material.mapImage)}`; stats.textureRepeat = material?.mapRepeat || [1,1]; stats.textureAnisotropy = material?.anisotropy ?? true; stats.texturePolicy = material?.texturePolicy || null; } if (mix) { stats.mixedTerrain = true; stats.mixTextureUrl = material?.mixTextureUrl || material.mixImage.src || material.mixImage.dataset?.url || 'generated-canvas'; stats.mixTextureSize = `${sourceWidth(material.mixImage)}x${sourceHeight(material.mixImage)}`; stats.mixRepeat = material?.mixRepeat || [1,1]; stats.mixStrength = material?.mixStrength ?? 0; stats.mixShaderFunction = 'mix()'; } }
}
function bindOne(gl, unit, uniform, texture) { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, texture); if (uniform) gl.uniform1i(uniform, unit); }
function sourceReady(source) { return !!(source && sourceWidth(source) && sourceHeight(source) && (source.complete !== false)); }
function sourceWidth(source) { return source?.naturalWidth || source?.videoWidth || source?.width || 0; }
function sourceHeight(source) { return source?.naturalHeight || source?.videoHeight || source?.height || 0; }
function createDefaultTexture(gl) { const texture = gl.createTexture(); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texture); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255,255,255,255])); setParams(gl, gl.NEAREST, gl.NEAREST, gl.CLAMP_TO_EDGE); return texture; }
function setParams(gl, min, mag, wrap) { gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, min); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, mag); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap); }
function isPot(n) { return n > 0 && (n & (n - 1)) === 0; }
