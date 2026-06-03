// B"H
/**
 * @file VillageHouseDoor.js
 * @description
 * Chapter 189: A human door, hinged outside the large house.
 *
 * The Awtsmoos makes the house huge but not absurd: the door leaf is now narrow,
 * textured, and aligned with the small doorway. It remains non-solid so it can
 * never become the invisible wall; the real passage is guarded only by the
 * separate authored collider file.
 */
import Domem from "../../chayim/domem/index.js";
import * as THREE from "/games/scripts/build/three.module.js";
import { material as texturedMaterial } from "./villagePicture/geometryKit.js";

const num = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
const wood = color => texturedMaterial(color, { textureMode: "wood" });
const brass = color => texturedMaterial(color, { textureMode: "stone", emissive: 0x2a1800, emissiveIntensity: 0.15 });

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
    this.hinge.position.set(-0.19, 0.34, 0.16);
    part(this.hinge, this, "door_leaf_grained", [0.19, 0, 0], [0.34, 0.68, 0.08], wood(0x74411d));
    part(this.hinge, this, "door_vertical_plank_left", [0.08, 0, -0.05], [0.035, 0.62, 0.035], wood(0x4a260e));
    part(this.hinge, this, "door_vertical_plank_right", [0.3, 0, -0.05], [0.035, 0.62, 0.035], wood(0x4a260e));
    part(this.hinge, this, "door_cross_bar", [0.19, 0.12, -0.055], [0.28, 0.045, 0.035], wood(0x321806));
    part(this.hinge, this, "door_knob", [0.31, -0.04, -0.075], [0.04, 0.04, 0.032], brass(0xffd05a));
    part(root, this, "door_click_box", [0, 0.36, 0.14], [0.52, 0.88, 0.48], new THREE.MeshBasicMaterial({ visible: false }), true);
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
