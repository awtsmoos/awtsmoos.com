// B"H
/** Growing entities carry proximity and the procedural Domem animation runtime. */
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import Domem from "./domem.js?compact=true&v=history-animation-compact-top-20260708-bh10";
import Utils from "../utils.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export default class Tzomayach extends Domem {
  type = "tzomayach"; proximity = 0; proximityCollider = null; objectsCollidingWith = [];
  constructor(options = {}, olam) {
    super(options, olam); this.options = options || {}; this.heesHawveh = true;
    let p = options.proximity; if (options.interactable && (p === undefined || p === null || p <= 0)) p = 1.0;
    this.proximity = typeof p === "number" ? p : 0; this.on("sealayk", () => { this.proximityCollider = null; });
  }
  async heescheel(olam) { await super.heescheel(olam); }
  async ready() { await super.ready(); }
  async afterBriyah() { await super.afterBriyah(this); }
  heesHawvoos(deltaTime) {
    super.heesHawvoos(deltaTime); if (this.proximity <= 0 || !this.mesh) return;
    if (!this.proximityCollider) { this.proximityCollider = new THREE.Sphere(this.mesh.position.clone(), this.proximity); return; }
    if (!this.olam) return; this.proximityCollider.center.copy(this.mesh.position);
    const interactables = this.olam.interactableNivrayim; if (!Array.isArray(interactables) || !interactables.length) return;
    interactables.forEach(n => this.checkProximitySoul(n));
  }
  checkProximitySoul(n) {
    if (n === this || !this.isCapsuleOwner(n)) return; const already = this.objectsCollidingWith.includes(n);
    const radius = already ? this.proximityCollider.radius * 1.2 : this.proximityCollider.radius;
    const collides = Utils.capsuleSphereColliding(n.collider, { center:this.proximityCollider.center, radius });
    if (collides && !already) return this.enterProximity(n); if (!collides && already) this.leaveProximity(n);
  }
  isCapsuleOwner(n) { try { return n?.collider?.constructor?.name === "Capsule"; } catch { return false; } }
  enterProximity(n) { this.objectsCollidingWith.push(n); this.ayshPeula("nivraNeechnas", n, this); if (typeof n.ayshPeula === 'function') n.ayshPeula("approached tzomayach", this); }
  leaveProximity(n) { this.objectsCollidingWith.splice(this.objectsCollidingWith.indexOf(n), 1); this.ayshPeula("nivraYotsee", n, this); if (typeof n.ayshPeula === 'function') n.ayshPeula("left tzomayach", this); }
}
