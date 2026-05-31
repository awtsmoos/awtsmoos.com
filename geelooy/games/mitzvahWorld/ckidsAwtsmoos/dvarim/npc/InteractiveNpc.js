// B"H
/**
 * @file InteractiveNpc.js
 * @description
 * Chapter 96: the NPC becomes light. The visible model is never the raycast
 * target, never the octree body, never the heavy thing the phone must interrogate.
 * A single herbal bounding box catches the click; an HTML overlay does the talk.
 */
import Medabeir from "../../chayim/medabeir/index.js";
import * as THREE from '/games/scripts/build/three.module.js';
import AwtsmoosThreeManifestor from "../../utils/3d/procedural/AwtsmoosThreeManifestor.js";

const AWTSMOOS_DIALOGUES = [
  "B\"H! The Awtsmoos creates this village every instant.",
  "Touch the button and I will open the ladder challenges.",
  "Every challenge is another small gate in the big world."
];

function sealVisualFromRayAndOctree(root, nivra) {
  root?.traverse?.(child => {
    child.nivraAwtsmoos = nivra;
    child.userData ||= {};
    child.userData.skipRaycast = true;
    child.userData.skipOctree = true;
    child.userData.noOctree = true;
    child.userData.isNpcVisual = true;
  });
}

export default class InteractiveNpc extends Medabeir {
  type = "interactiveNpc";
  static itemName = "Messenger";
  static description = "A soulful resident of this world. Speak with them.";

  constructor(op = {}, olam) {
    op.proximity = op.proximity || 4.8;
    op.interactable = true;
    op.heesHawveh = true;
    op.visualHeight = op.visualHeight || 1.65;
    op.path = op.simpleGuide ? null : op.path || "https://models-3122d.web.app/chossid.glb?k=2";
    op.golem = op.simpleGuide ? op.golem || { guf: { CylinderGeometry: [0.32, 0.42, 1.65, 10] }, toyr: { MeshLambertMaterial: { color: 0xffd166, emissive: 0x221100 } } } : op.golem;
    super(op, olam);
    this.options = op;
    this.dialogues = op.dialogues || op.dialogue || op.dialog || AWTSMOOS_DIALOGUES;
    this.interactKey = 'C';
    this.radius = 0.42;
    this.height = op.visualHeight || 1.65;
    this._makeRayProxy();
    this._setupMessageTree();
    this._setupEventHandlers();
  }

  _makeRayProxy() {
    const geo = new THREE.BoxGeometry(1.35, 2.3, 1.35);
    const mat = new THREE.MeshBasicMaterial({ color: 0x72ff95, transparent: true, opacity: 0, depthWrite: false });
    this.interactionMesh = new THREE.Mesh(geo, mat);
    this.interactionMesh.name = "NPC_Herbal_Bounding_Box";
    this.interactionMesh.nivraAwtsmoos = this;
    this.interactionMesh.userData.awtsmoosRayProxy = true;
    this.interactionMesh.userData.skipOctree = true;
    this.interactionMesh.userData.noOctree = true;
    this.raycastMesh = this.interactionMesh;
  }

  _setupMessageTree() {
    const source = this.dialogues?.length ? this.dialogues : AWTSMOOS_DIALOGUES;
    this.messageTree = source.map((message, i) => ({ message, responses: [{ text: "Choose levels", close: true }, { text: "Tell me more", nextMessageIndex: (i + 1) % source.length }] }));
  }

  async heescheel(olam) {
    await super.heescheel(olam);
    if (!this.mesh) this.mesh = new THREE.Object3D();
    this.mesh.nivraAwtsmoos = this;
    this.mesh.userData ||= {};
    this.mesh.userData.skipOctree = true;
    this.mesh.userData.noOctree = true;
    this.mesh.userData.skipRaycast = true;
    sealVisualFromRayAndOctree(this.mesh, this);
    if (this.options.clothes && typeof this.updateAppearance === 'function') this.updateAppearance();
    else if (typeof this.randomizeAppearance === 'function') this.randomizeAppearance();
    this.interactionMesh.position.set(0, this.height * 0.58, 0);
    this.mesh.add(this.interactionMesh);
    if (this.options.hasMission || this.options.missionId || this.options.opensLevelSelect) this._addMissionMark(0xffff00);
    else if (this.options.canDebate) this._addMissionMark(0xff0000);
    else if (this.options.hasShop) this._addMissionMark(0x00ff00);
    if (this.olam.interactableNivrayim && !this.olam.interactableNivrayim.includes(this)) this.olam.interactableNivrayim.push(this);
    this.isReady = true;
  }

  _addMissionMark(color) {
    const markBlueprint = { type: "Group", children: [
      { type: "Mesh", geometry: { type: "CylinderGeometry", args: [0.05, 0.05, 0.4, 8] }, material: { type: "MeshBasicMaterial", args: [{ color }] }, position: [0, this.height + 0.55, 0] },
      { type: "Mesh", geometry: { type: "SphereGeometry", args: [0.08, 8, 8] }, material: { type: "MeshBasicMaterial", args: [{ color }] }, position: [0, this.height + 0.15, 0] }
    ] };
    this.missionMark = AwtsmoosThreeManifestor.emanate(markBlueprint);
    sealVisualFromRayAndOctree(this.missionMark, this);
    this.mesh.add(this.missionMark);
  }

  _setupEventHandlers() {
    this.on("accepted interaction", player => this._acceptInteraction(player));
    this.on("mouseEnter", () => this.olam.ayshPeula("ui event", "tooltip", { show: true, text: this.options.opensLevelSelect ? "Talk: choose levels" : "Talk" }));
    this.on("mouseLeave", () => this.olam.ayshPeula("ui event", "tooltip", { show: false }));
    this.on("pointerdown", () => this.emit("accepted interaction", this.olam.chossid));
  }

  _acceptInteraction(player) {
    if (this.options.opensLevelSelect) {
      this.olam.ayshPeula("ui event", "openNpcChallengeOverlay", { fromNpc: this.name, title: "Choose Levels", lines: this.dialogues, selectorTitle: this.options.selectorTitle || "NPC CHALLENGES" });
      return;
    }
    if (this.options.canDebate) return this.olam.ayshPeula("start battle", { opponent: this });
    if (this.options.hasShop) return this.olam.ayshPeula("ui event", "openShop", { inventory: this.options.shopInventory || [] });
    this.speak();
  }

  speak() {
    const source = this.dialogues?.length ? this.dialogues : AWTSMOOS_DIALOGUES;
    const message = source[Math.floor(Math.random() * source.length)];
    this.olam.ayshPeula("ui event", "openNpcChallengeOverlay", { fromNpc: this.name, title: this.name || "NPC", lines: [message], chatOnly: true });
  }

  heesHawvoos(dt) {
    if (this.missionMark) {
      this.missionMark.rotation.y += dt * 2.0;
      this.missionMark.position.y = this.height + 0.55 + Math.sin(Date.now() * 0.005) * 0.1;
    }
    super.heesHawvoos(dt);
  }
}
