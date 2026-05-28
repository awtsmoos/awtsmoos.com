// B"H
/**
 * @module SolidBlock
 * @description
 * Chapter 6: Each platform wears a tiny unique desert grain.
 *
 * Ten platforms get ten tiny 16x16 DataTextures: visually unique, but light
 * enough to avoid stressing WebGL on older laptops. No mipmaps, no loaders.
 */
import Domem from "../../chayim/domem/index.js";
import * as THREE from '/games/scripts/build/three.module.js';

function hashText(text = "") {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

function colorTriplet(hex) {
  return [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];
}

function platformTexture(seed, baseHex) {
  const size = 16;
  const h = hashText(seed);
  const base = colorTriplet(baseHex);
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const i = (y * size + x) * 4;
      const stripe = ((x + (h % 7)) % (4 + (h % 3))) === 0 ? 18 : 0;
      const wave = Math.sin((x * 3.1) + (y * 5.7) + h) * 18;
      const shade = Math.round(wave + stripe - 8);
      data[i] = Math.max(0, Math.min(255, base[0] + shade));
      data[i + 1] = Math.max(0, Math.min(255, base[1] + shade));
      data[i + 2] = Math.max(0, Math.min(255, base[2] + shade));
      data[i + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3 + (h % 3), 3 + ((h >> 3) % 3));
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

export default class SolidBlock extends Domem {
  type = "solidBlock";

  constructor(op = {}, olam) {
    super(op, olam);
    this.width = op.width || 1;
    this.height = op.height || 1;
    this.depth = op.depth || 1;
    this.color = op.color || 0x808080;
    this.textureSeed = op.textureSeed || op.name || "platform";
  }

  async heescheel(olam) {
    this.olam = olam;
    const geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
    const material = new THREE.MeshLambertMaterial({ color: 0xffffff, map: platformTexture(this.textureSeed, this.color) });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.name = this.name;
    this.mesh.nivraAwtsmoos = this;
    this.mesh.visible = true;
    this.mesh.frustumCulled = true;

    if (this.position) this.mesh.position.set(this.position.x || 0, this.position.y || 0, this.position.z || 0);

    this.mesh.updateMatrixWorld(true);
    this.mesh.userData.isSolid = true;
    await olam.hoyseef(this);
    olam.worldOctree?.addObject(this.mesh);
    this.isReady = true;
  }
}
