// B"H
/**
 * @file VillageHouseDoor.js
 * @description
 * Chapter 174: The door receives grain, not dead color.
 *
 * The house may be 4.8x, but the leaf remains human-sized and textured. The
 * click box is invisible by design; every visible door part uses the same
 * procedural material system as the cottage, so no flat brown rectangle returns.
 * Future AI: do not enlarge this door to match the house scale.
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
    this.openAngle = num(op.openAngle, -1.3);
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
    this.hinge.position.set(-0.23, 0.39, 0.14);
    part(this.hinge, this, "door_leaf", [0.23, 0, 0], [0.42, 0.78, 0.09], wood(0x7a421e));
    part(this.hinge, this, "door_cross", [0.23, 0.13, -0.06], [0.32, 0.05, 0.04], wood(0x3a1d0b));
    part(this.hinge, this, "door_knob", [0.36, -0.04, -0.09], [0.045, 0.045, 0.035], brass(0xffd05a));
    part(root, this, "door_click_box", [0, 0.43, 0.12], [0.62, 1.04, 0.55], new THREE.MeshBasicMaterial({ visible: false }), true);
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
