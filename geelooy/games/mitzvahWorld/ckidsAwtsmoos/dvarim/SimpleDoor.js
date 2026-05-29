// B"H
import Tzomayach from "../chayim/tzomayach.js";
import * as THREE from "/games/scripts/build/three.module.js";

/**
 * @file SimpleDoor.js
 * @description
 * Chapter 49: The gate refuses invisibility.
 * The Awtsmoos no longer waits for a maybe-event. The lifecycle `ready()`
 * itself builds the golden frame, mezuzah, and glowing sign on the real mesh.
 */
export default class SimpleDoor extends Tzomayach {
  type = "interactiveDoor";
  static itemName = "Door";

  constructor(op = {}, olam) {
    op.interactable = true; op.proximity = op.proximity || 4.8; op.isSolid = false;
    op.rotation ||= { y: Math.PI / 2 };
    op.scale ||= { x: 1.25, y: 1.25, z: 1.25 };
    op.golem = op.golem || { guf: { BoxGeometry: [2.2, 3.6, 0.42] }, toyr: { MeshBasicMaterial: { color: op.color || 0x7b3f1d } } };
    super(op, olam);
    this.next = op.next || op.target || null;
    this.label = op.label || op.name || "Gate";
    this.frameColor = op.frameColor || 0xffd35a;
    this.mezuzahColor = op.mezuzahColor || 0x70fff2;
  }

  /** @returns {Promise<void>} */
  async ready() {
    await super.ready?.();
    this.decorateDoor();
  }

  /** @returns {void} */
  decorateDoor() {
    if (!this.mesh || this.mesh.userData.awtsDecoratedDoor) return;
    this.mesh.userData.awtsDecoratedDoor = true;
    this.mesh.rotation.y = Math.PI / 2;
    const frame = new THREE.MeshBasicMaterial({ color: this.frameColor });
    const glow = new THREE.MeshBasicMaterial({ color: this.mezuzahColor });
    const sign = new THREE.MeshBasicMaterial({ color: 0xfff2a0 });
    [
      ["left", [-1.36, 0.05, 0], [0.34, 4.2, 0.68], frame],
      ["right", [1.36, 0.05, 0], [0.34, 4.2, 0.68], frame],
      ["lintel", [0, 2.08, 0], [3.05, 0.34, 0.7], frame],
      ["mezuzah", [1.62, 0.45, -0.44], [0.14, 1.02, 0.12], glow],
      ["crown", [0, 2.48, -0.02], [1.0, 0.16, 0.76], sign]
    ].forEach(([name, p, s, mat]) => this.addBox(name, p, s, mat));
  }

  /** @param {string} name @param {number[]} p @param {number[]} s @param {THREE.Material} mat @returns {void} */
  addBox(name, p, s, mat) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...s), mat);
    mesh.name = `${this.name || "Door"}_${name}`; mesh.position.set(...p);
    mesh.userData.skipRaycast = true; mesh.userData.addToOctree = false;
    this.mesh.add(mesh);
  }

  showPrompt(nivra) {
    if (nivra?.type !== "chossid") return;
    this.olam?.ayshPeula?.("ui event", "effectsOverlay", { text: `${this.label} — press / tap`, color: "#ffd166" });
  }

  requestNavigation() {
    if (!this.next) return;
    this.olam?.ayshPeula?.("ui event", "navigateLevel", { next: this.next, label: this.label, source: "SimpleDoor" });
  }

  heesHawvoos(delta) {
    super.heesHawvoos?.(delta);
    const player = this.olam?.chossid?.mesh?.position || this.olam?.chossid?.modelMesh?.position;
    if (!player || !this.mesh) return;
    if (player.distanceTo(this.mesh.position) < this.proximity) this.showPrompt(this.olam?.chossid);
  }
}
