// B"H
/**
 * @file tzomayach.js
 * @description
 * Chapter 63: The Growing Thing Carried The Fast Body.
 *
 * The Awtsmoos cache-busts the Domem ancestry while preserving proximity
 * interaction. Player animation fixes now reach every Chai through this branch.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import Domem from "./domem.js?v=fast-platformer-blend-20260602-bh15";
import Utils from "../utils.js";

export default class Tzomayach extends Domem {
  type = "tzomayach";
  proximity = 0;
  proximityCollider = null;
  objectsCollidingWith = [];

  /** @param {object} options Entity options. @param {object} olam World. */
  constructor(options = {}, olam) {
    super(options, olam);
    this.options = options || {};
    this.heesHawveh = true;
    let p = options.proximity;
    if (options.interactable && (p === undefined || p === null || p <= 0)) p = 1.0;
    this.proximity = typeof p === "number" ? p : 0;
    this.on("sealayk", () => { this.proximityCollider = null; });
  }

  /** @param {object} olam Runtime world. */
  async heescheel(olam) { await super.heescheel(olam); }

  /** @returns {Promise<void>} */
  async ready() { await super.ready(); }

  /** @returns {Promise<void>} */
  async afterBriyah() { await super.afterBriyah(this); }

  /** @param {number} deltaTime Frame delta. */
  heesHawvoos(deltaTime) {
    super.heesHawvoos(deltaTime);
    if (this.proximity <= 0 || !this.mesh) return;
    if (!this.proximityCollider) {
      this.proximityCollider = new THREE.Sphere(this.mesh.position.clone(), this.proximity);
      return;
    }
    if (!this.olam) return;
    this.proximityCollider.center.copy(this.mesh.position);
    const interactables = this.olam.interactableNivrayim;
    if (!Array.isArray(interactables) || !interactables.length) return;
    interactables.forEach(n => this.checkProximitySoul(n));
  }

  /** @param {object} n Candidate entity. */
  checkProximitySoul(n) {
    if (n === this || !this.isCapsuleOwner(n)) return;
    const already = this.objectsCollidingWith.includes(n);
    const radius = already ? this.proximityCollider.radius * 1.2 : this.proximityCollider.radius;
    const collides = Utils.capsuleSphereColliding(n.collider, { center: this.proximityCollider.center, radius });
    if (collides && !already) return this.enterProximity(n);
    if (!collides && already) this.leaveProximity(n);
  }

  /** @param {object} n Candidate entity. @returns {boolean} */
  isCapsuleOwner(n) {
    try { return n?.collider?.constructor?.name === "Capsule"; }
    catch { return false; }
  }

  /** @param {object} n Entity entering. */
  enterProximity(n) {
    this.objectsCollidingWith.push(n);
    this.ayshPeula("nivraNeechnas", n, this);
    if (typeof n.ayshPeula === 'function') n.ayshPeula("approached tzomayach", this);
  }

  /** @param {object} n Entity leaving. */
  leaveProximity(n) {
    this.objectsCollidingWith.splice(this.objectsCollidingWith.indexOf(n), 1);
    this.ayshPeula("nivraYotsee", n, this);
    if (typeof n.ayshPeula === 'function') n.ayshPeula("left tzomayach", this);
  }
}
