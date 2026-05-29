// B"H
import Domem from "../chayim/domem/index.js";
import * as THREE from "/games/scripts/build/three.module.js";

/**
 * @file SimpleDoor.js
 * @description
 * Chapter 52: The visible wall is gone; the mezuzah is the gate.
 * The Awtsmoos hides the trigger inside the right post, and when the Chossid
 * touches that inner cyan spark, the next level opens like a breath.
 */
export default class SimpleDoor extends Domem {
  type = "interactiveDoor";
  heesHawveh = true;
  static itemName = "Door";

  constructor(op = {}, olam) {
    super({ ...op, golem: null, isSolid: false, interactable: false }, olam);
    this.next = op.next || op.target || op.destination || null;
    this.label = op.label || op.name || "Mezuzah";
    this.proximity = Number(op.proximity || 1.2);
    this._inside = false;
    this._navigated = false;
  }

  async heescheel(olam) {
    this.olam = olam;
    this.mesh = this.buildMezuzahTrigger();
    this.mesh.position.copy(this.position.vector3());
    this.mesh.userData.skipRaycast = true;
    this.mesh.userData.addToOctree = false;
    await olam.hoyseef(this);
    this.isReady = true;
  }

  buildMezuzahTrigger() {
    const root = new THREE.Group();
    root.name = `${this.name || "Door"}_Inside_Mezuzah_Trigger`;
    const glow = new THREE.MeshBasicMaterial({ color: 0x72fff4 });
    const core = new THREE.MeshBasicMaterial({ color: 0x102d2c });
    this.addBox(root, "cyan_case", [0, 0, 0], [0.22, 1.25, 0.16], glow);
    this.addBox(root, "dark_scroll", [0, 0, -0.085], [0.1, 0.82, 0.04], core);
    return root;
  }

  addBox(root, name, p, s, mat) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...s), mat);
    mesh.name = `${this.name || "Door"}_${name}`;
    mesh.position.set(...p);
    mesh.userData.skipRaycast = true;
    mesh.userData.addToOctree = false;
    root.add(mesh);
  }

  heesHawvoos() {
    const p = this.olam?.chossid?.mesh?.position || this.olam?.chossid?.modelMesh?.position;
    if (!p || !this.mesh || this._navigated) return;
    const near = p.distanceTo(this.mesh.position) < this.proximity;
    if (near) this.openNextLevel();
    this._inside = near;
  }

  openNextLevel() {
    if (!this.next || this._navigated) return;
    this._navigated = true;
    this.olam?.ayshPeula?.("ui event", "effectsOverlay", { text: "Mezuzah touched — next gate opens", color: "#72fff4" });
    this.olam?.ayshPeula?.("ui event", "navigateLevel", { next: this.next, label: this.label, source: "inside-mezuzah" });
  }
}
