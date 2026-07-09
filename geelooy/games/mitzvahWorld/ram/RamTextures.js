// B"H
export const GRASS_URL = "https://awtsmoos-docs-base.web.app/full-resolution/grass%201.png";

function fallbackGrass(THREE) {
  const size = 32;
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const blade = ((x * 17 + y * 31 + (x ^ y) * 9) % 23) / 22;
      const color = blade > .72 ? 0x6fd64d : blade < .22 ? 0x17691f : 0x2fa238;
      data[i] = (color >> 16) & 255;
      data[i + 1] = (color >> 8) & 255;
      data[i + 2] = color & 255;
      data[i + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(28, 24);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.needsUpdate = true;
  return texture;
}

function tune(THREE, texture) {
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(28, 24);
  texture.anisotropy = 4;
  if (THREE.SRGBColorSpace) texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

export function meadowMaterial(THREE, onStatus = () => {}) {
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: fallbackGrass(THREE),
    roughness: .92,
    metalness: 0,
    side: THREE.DoubleSide
  });
  material.userData.ramGrassDiffuseOnly = true;
  new THREE.TextureLoader().load(
    GRASS_URL,
    texture => {
      material.map = tune(THREE, texture);
      material.needsUpdate = true;
      onStatus("Grass diffuse loaded.");
    },
    undefined,
    () => onStatus("Grass diffuse fallback active.")
  );
  return material;
}
