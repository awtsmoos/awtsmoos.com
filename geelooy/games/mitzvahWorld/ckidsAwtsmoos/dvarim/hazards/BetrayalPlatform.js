// B"H
import SolidBlock from "../architecture/SolidBlock.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";

/**
 * @file BetrayalPlatform.js
 * @description Chapter 65: the stone smiles, waits, then confesses. A normal
 * platform becomes a cracked vessel; when the chossid lands close, the Awtsmoos
 * reveals the hidden letters of collapse and the slab breaks into many little
 * falling blocks. The level designer can use it as a real shattering platform,
 * not just a disappearing rectangle.
 */
const DEFAULT_COLOR = 0x8866ff;

export default class BetrayalPlatform extends SolidBlock {
  type = "betrayalPlatform";
  static itemName = "Shattering Betrayal Platform";

  /** @param {object} op Authored level data. @param {object} olam Runtime world. */
  constructor(op = {}, olam) {
    super({ ...op, color: op.color || DEFAULT_COLOR }, olam);
    this.proximity = op.proximity || 1.7;
    this.interactable = true;
    this.dropDelayMs = op.dropDelayMs || 260;
    this.fallSpeed = op.fallSpeed || 12;
    this.shardCount = op.shardCount || 18;
    this.shardLifeMs = op.shardLifeMs || 2400;
    this._armed = false;
    this._falling = false;
    this._shards = [];
    this.heesHawveh = true;
    this.on("nivraNeechnas", nivra => this.armIfPlayer(nivra));
  }

  /** @param {object} nivra Entering being. @returns {void} */
  armIfPlayer(nivra) {
    if (this._armed || nivra?.type !== "chossid") return;
    this._armed = true;
    this.flashWarning();
    setTimeout(() => this.shatterIntoBlocks(), this.dropDelayMs);
  }

  /** @returns {void} Makes the platform visually warn before breaking. */
  flashWarning() {
    if (!this.mesh?.material) return;
    this.mesh.material.color?.setHex?.(0xff8844);
    this.mesh.material.emissive?.setHex?.(0x552200);
  }

  /** @returns {void} Converts the solid slab into falling cube fragments. */
  shatterIntoBlocks() {
    if (this._falling || !this.mesh) return;
    this._falling = true;
    this.removeSolidCollision();
    this.spawnShards();
    this.mesh.visible = false;
  }

  /** @returns {void} Removes original slab from collision paths when possible. */
  removeSolidCollision() {
    if (!this.mesh) return;
    this.mesh.userData.isSolid = false;
    this.mesh.userData.addToOctree = false;
    this.olam?.worldOctree?.removeMesh?.(this.mesh);
  }

  /** @returns {void} Spawns authored shatter cubes around the original slab. */
  spawnShards() {
    const scene = this.olam?.scene || this.mesh?.parent;
    if (!scene || !this.mesh) return;
    const size = this.getShardSize();
    const material = this.getShardMaterial();
    for (let i = 0; i < this.shardCount; i += 1) scene.add(this.makeShard(i, size, material));
  }

  /** @returns {THREE.Vector3} Approximate fragment size. */
  getShardSize() {
    const sx = Math.max(0.18, Number(this.width || 2.8) / 5);
    const sy = Math.max(0.14, Number(this.height || 0.8) / 2);
    const sz = Math.max(0.18, Number(this.depth || 2.2) / 5);
    return new THREE.Vector3(sx, sy, sz);
  }

  /** @returns {THREE.Material} New shard material. */
  getShardMaterial() {
    const color = this.mesh?.material?.color?.getHex?.() || DEFAULT_COLOR;
    return new THREE.MeshLambertMaterial({ color, emissive: 0x221100 });
  }

  /** @param {number} index Shard index. @param {THREE.Vector3} size Size. @param {THREE.Material} material Material. @returns {THREE.Mesh} */
  makeShard(index, size, material) {
    const shard = new THREE.Mesh(new THREE.BoxGeometry(size.x, size.y, size.z), material.clone());
    shard.name = `${this.name || "betrayal"}_shard_${index}`;
    shard.position.copy(this.mesh.position);
    shard.position.x += (Math.random() - 0.5) * Number(this.width || 2.8);
    shard.position.z += (Math.random() - 0.5) * Number(this.depth || 2.2);
    shard.userData.velocity = new THREE.Vector3((Math.random() - 0.5) * 0.28, 0.12 + Math.random() * 0.22, (Math.random() - 0.5) * 0.28);
    shard.userData.birth = performance.now?.() || Date.now();
    shard.userData.life = this.shardLifeMs;
    shard.userData.addToOctree = false;
    shard.userData.isSolid = false;
    this._shards.push(shard);
    return shard;
  }

  /** @param {number} dt Delta seconds. @returns {void} */
  heesHawvoos(dt = 0.016) {
    this.animateShards(dt);
    if (!this._falling || !this.mesh) return;
    this.mesh.position.y -= this.fallSpeed * dt;
    if (this.mesh.position.y < -40) this.olam?.sealayk?.(this);
  }

  /** @param {number} dt Delta seconds. @returns {void} */
  animateShards(dt) {
    const now = performance.now?.() || Date.now();
    this._shards = this._shards.filter(shard => {
      const age = now - shard.userData.birth;
      if (age > shard.userData.life) { shard.parent?.remove(shard); return false; }
      shard.position.addScaledVector(shard.userData.velocity, dt * 60);
      shard.userData.velocity.y -= 0.018;
      shard.rotation.x += dt * 4.5;
      shard.rotation.z += dt * 3.5;
      return true;
    });
  }
}
