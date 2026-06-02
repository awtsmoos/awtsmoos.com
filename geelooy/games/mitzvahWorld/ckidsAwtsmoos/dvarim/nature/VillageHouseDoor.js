// B"H
/**
 * @file VillageHouseDoor.js
 * @description
 * Chapter 147: The small cottage door sits flush in the human doorway.
 *
 * The doorway was too large because the whole house is scaled. The door leaf is
 * therefore authored small locally, then scaled with the house. Future AI: do
 * not detach this door from the front-center anchor and never feed it to octree.
 */
import Domem from "../../chayim/domem/index.js";
import * as THREE from "/games/scripts/build/three.module.js";

const num = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
const mat = color => new THREE.MeshLambertMaterial({ color });

function part(root, owner, name, pos, size, material, ray = false) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.name = name;
  mesh.position.set(...pos);
  Object.assign(mesh.userData ||= {}, { addToOctree: false, skipOctree: true, noOctree: true, skipRaycast: !ray });
  mesh.nivraAwtsmoos = owner;
  root.add(mesh);
  return mesh;
}

export default class VillageHouseDoor extends Domem {
  type = "interactiveDoor";
  heesHawveh = true;

  constructor(op = {}, olam) {
    super({ ...op, golem: null, isSolid: false, interactable: true }, olam);
    this.options = op;
    this.scaleValue = num(op.scale, 1);
    this.open = Boolean(op.open);
    this.openAngle = num(op.openAngle, -1.22);
    this.target = this.open ? this.openAngle : 0;
    this.angle = this.target;
    this.proximity = num(op.proximity, 7.5);
  }

  async heescheel(olam) {
    this.olam = olam;
    this.mesh = this.buildDoor();
    this.mesh.position.copy(this.position.vector3());
    this.mesh.rotation.y = num(this.rotation?.y, 0);
    this.mesh.scale.setScalar(this.scaleValue);
    this.mesh.nivraAwtsmoos = this;
    await olam.hoyseef(this);
    if (olam.interactableNivrayim && !olam.interactableNivrayim.includes(this)) olam.interactableNivrayim.push(this);
    this.isReady = true;
  }

  buildDoor() {
    const root = new THREE.Group();
    root.name = this.name || "VillageHouseDoor";
    this.hinge = new THREE.Group();
    this.hinge.position.set(-0.34, 0.61, 0.16);
    part(this.hinge, this, "door_leaf", [0.34, 0, 0], [0.64, 1.14, 0.12], mat(0x7a421e));
    part(this.hinge, this, "door_cross", [0.34, 0.2, -0.08], [0.48, 0.07, 0.06], mat(0x3a1d0b));
    part(this.hinge, this, "door_knob", [0.58, -0.04, -0.13], [0.065, 0.065, 0.05], mat(0xffd05a));
    part(root, this, "door_click_box", [0, 0.64, 0.12], [0.9, 1.55, 0.72], new THREE.MeshBasicMaterial({ visible: false }), true);
    root.add(this.hinge);
    root.traverse(child => { child.nivraAwtsmoos = this; child.frustumCulled = false; });
    return root;
  }

  ayshPeula(peula) {
    if (peula === "mouseEnter") return this.olam?.ayshPeula?.("ui event", "tooltip", { show: true, text: this.open ? "Close door" : "Open door" });
    if (peula === "mouseLeave") return this.olam?.ayshPeula?.("ui event", "tooltip", { show: false });
    if (peula !== "accepted interaction" && peula !== "pointerdown") return super.ayshPeula?.(peula);
    this.open = !this.open;
    this.target = this.open ? this.openAngle : 0;
    this.olam?.ayshPeula?.("ui event", "effectsOverlay", { text: this.open ? "Door opened" : "Door closed", color: "#ffd35b", replace: true });
    return true;
  }

  heesHawvoos(dt) {
    this.angle += (this.target - this.angle) * Math.min(1, dt * 10);
    if (this.hinge) this.hinge.rotation.y = this.angle;
  }
}
