// B"H
/**
 * @file GroundTextureLoader.js
 * @description Immediate fallback textures that become hosted textures when loaded.
 *
 * A remote image may arrive one heartbeat later than the mesh. The ground may not
 * vanish while waiting. So each sampler receives a tiny colored seed first, then
 * the real hosted image descends into the same uniform when the network opens.
 */
const FALLBACK_RGBA = Object.freeze([
  [82, 140, 54, 255],
  [107, 91, 58, 255],
  [92, 123, 63, 255],
  [126, 104, 65, 255],
  [96, 72, 47, 255],
  [73, 151, 60, 255]
]);

function fallbackRgba(index) {
  return FALLBACK_RGBA[index % FALLBACK_RGBA.length];
}

function makeFallbackTexture(THREE, index) {
  const texture = new THREE.DataTexture(new Uint8Array(fallbackRgba(index)), 1, 1, THREE.RGBAFormat);
  texture.name = `awtsmoos_ground_fallback_${index}`;
  texture.needsUpdate = true;
  return texture;
}

function prepareTexture(THREE, texture, repeat, anisotropy) {
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat?.set?.(repeat, repeat);
  texture.anisotropy = Math.max(1, Number(anisotropy) || 4);
  if (THREE.SRGBColorSpace) texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

export function createGroundTextureUniforms(THREE, urls) {
  return Object.fromEntries(urls.map((url, index) => [
    `groundTexture${index}`,
    { value:makeFallbackTexture(THREE, index) }
  ]));
}

export function loadGroundTextures(THREE, urls, material, options = {}) {
  const repeat = Math.max(0.25, Number(options.repeat) || 18);
  const report = {
    seal:"hosted-ground-textures-20260708-bh1",
    at:Date.now(),
    requested:urls.length,
    loaded:0,
    failed:0,
    urls:[...urls],
    failures:[]
  };
  material.userData ||= {};
  material.userData.groundTextureReport = report;
  try { globalThis.__AWTSMOOS_GROUND_TEXTURE_PROOF__ = () => report; } catch {}
  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin?.("anonymous");
  urls.forEach((url, index) => {
    loader.load(url, texture => {
      const uniform = material.uniforms?.[`groundTexture${index}`];
      if (!uniform) return;
      uniform.value = prepareTexture(THREE, texture, repeat, options.anisotropy);
      report.loaded += 1;
      report.lastLoaded = { index, url, at:Date.now() };
      material.needsUpdate = true;
    }, undefined, error => {
      report.failed += 1;
      report.failures.push({ index, url, message:error?.message || String(error), at:Date.now() });
    });
  });
  return report;
}
