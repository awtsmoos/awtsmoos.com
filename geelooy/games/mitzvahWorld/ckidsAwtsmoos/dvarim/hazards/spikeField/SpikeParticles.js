// B"H
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";

const LETTERS = Object.freeze("קראטוןןםפףךלחיעכגדשזסבהנמצתץאבגדהוזחיכלמנסעפצשת".split(""));
const stamp = () => globalThis.performance?.now?.() || Date.now();

/**
 * @file SpikeParticles.js
 * @description Chapter 86: the lava burst slows into readable sparks. The
 * Awtsmoos lets Hebrew letters emerge like embers from the final landing point,
 * not like instant noise. No canvas. No DOM. Just geometry and living letters.
 */
export class SpikeParticleFactory {
  constructor(olam = null) { this.olam = olam; }
  createMany(origin, count = 48) { return Array.from({ length: count }, (_, index) => this.create(origin, index)); }

  create(origin, index) {
    const mesh = index % 3 ? this.makeHebrewParticle(index) : this.makeBlock(index);
    mesh.position.copy(origin);
    mesh.position.y += 0.72;
    mesh.userData.velocity = new THREE.Vector3((Math.random() - 0.5) * 0.24, 0.08 + Math.random() * 0.24, (Math.random() - 0.5) * 0.24);
    mesh.userData.birth = stamp();
    mesh.userData.life = 4300;
    mesh.frustumCulled = false;
    return mesh;
  }

  makeHebrewParticle(index) {
    const letter = LETTERS[index % LETTERS.length];
    const color = index % 2 ? 0xffd54a : 0xff6b2a;
    const existing = this.olam?.makeNewHebrewLetter?.(letter, { color });
    if (existing) return this.prepareExistingLetter(existing, index);
    return this.makeFallbackGlyph(index, letter, color);
  }

  prepareExistingLetter(mesh, index) {
    mesh.name = `awtsmoos_existing_3d_hebrew_spark_${index}`;
    mesh.scale.setScalar(1.25);
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    mesh.userData.fromExistingHebrewLetterSystem = true;
    return mesh;
  }

  makeFallbackGlyph(index, letter, color) {
    const group = new THREE.Group();
    group.name = `awtsmoos_geometry_hebrew_spark_${letter}_${index}`;
    this.glyphBars(index, color).forEach(bar => group.add(bar));
    group.userData.fallbackHebrewLetter = letter;
    return group;
  }

  glyphBars(index, color) {
    const material = new THREE.MeshLambertMaterial({ color, emissive: 0x331000 });
    return [
      this.bar(material, -0.18, 0.18, 0, 0.18, 0.92, 0.12, 0.4 + index * 0.11),
      this.bar(material, 0.2, 0.1, 0, 0.18, 0.72, 0.12, -0.45 + index * 0.07),
      this.bar(material, 0.02, 0.42, 0, 0.86, 0.16, 0.12, index * 0.05)
    ];
  }

  bar(material, x, y, z, w, h, d, r) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z);
    mesh.rotation.z = r;
    return mesh;
  }

  makeBlock(index) {
    const material = new THREE.MeshLambertMaterial({ color: index % 2 ? 0xff5122 : 0xffd54a, emissive: 0x661100 });
    return new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.34, 0.34), material);
  }
}

export function animateSpikeParticles(particles) {
  const now = stamp();
  return particles.filter(mesh => {
    const age = now - mesh.userData.birth;
    if (age > mesh.userData.life) {
      mesh.parent?.remove(mesh);
      return false;
    }
    mesh.position.add(mesh.userData.velocity);
    mesh.userData.velocity.y -= 0.0026;
    mesh.rotation.x += 0.026;
    mesh.rotation.y += 0.021;
    mesh.scale.setScalar(Math.max(0.08, 1 - age / mesh.userData.life));
    return true;
  });
}
