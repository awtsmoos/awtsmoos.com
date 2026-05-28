// B"H
/**
 * @file SpikeHazard.js
 * @description Chapter 13: Spike death hides the player and opens reset veil.
 */
import Tzomayach from "../../chayim/tzomayach.js";
import * as THREE from '/games/scripts/build/three.module.js';

const HEBREW = ["א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט", "י", "כ", "ל", "מ"];
const schedule = cb => (typeof requestAnimationFrame === "function" ? requestAnimationFrame(cb) : setTimeout(cb, 16));

function hideObjectTree(obj) {
  if (!obj) return;
  obj.visible = false;
  if (obj.scale?.setScalar) obj.scale.setScalar(0.001);
  if (obj.traverse) obj.traverse(child => {
    child.visible = false;
    if (child.scale?.setScalar) child.scale.setScalar(0.001);
  });
}

function hidePlayer(nivra) {
  hideObjectTree(nivra?.mesh);
  hideObjectTree(nivra?.modelMesh);
  hideObjectTree(nivra?.guf);
  hideObjectTree(nivra?.visualObject);
  if (nivra?.mesh?.position) nivra.mesh.position.y = -999;
  if (nivra?.modelMesh?.position) nivra.modelMesh.position.y = -999;
}

export default class SpikeHazard extends Tzomayach {
  type = "spikeHazard";
  static itemName = "Spike Hazard";
  static description = "A grounded thorn. True contact pauses and asks for reset.";

  constructor(op = {}, olam) {
    op.interactable = true;
    op.proximity = Number.isFinite(op.proximity) ? op.proximity : 1.35;
    op.verticalHitRange = Number.isFinite(op.verticalHitRange) ? op.verticalHitRange : 4.2;
    op.groundY = Number.isFinite(op.groundY) ? op.groundY : -3;
    op.height = Number.isFinite(op.height) ? op.height : 1.65;
    op.golem ||= {
      guf: { ConeGeometry: [op.radius || 1.1, op.height, 4] },
      toyr: { MeshStandardMaterial: { color: 0xff2233, emissive: 0xaa1100, roughness: 0.7, metalness: 0.1 } }
    };
    super(op, olam);
    this.penalty = op.penalty || 0;
    this.groundY = op.groundY;
    this.height = op.height;
    this.verticalHitRange = op.verticalHitRange;
    this.proximity = op.proximity;
    this._triggered = false;
    this.heesHawveh = true;
    this.on("ready", () => this.afterReadyGrounding());
    this.on("nivraNeechnas", nivra => this.hit(nivra));
  }

  afterReadyGrounding() {
    if (!this.mesh) return;
    this.mesh.rotation.y = Math.PI / 4;
    this.mesh.userData.isSolid = false;
    this.mesh.userData.skipRaycast = true;
    const centerY = this.groundY + this.height / 2;
    this.mesh.position.y = centerY;
    this.position ||= {};
    this.position.y = centerY;
    this.mesh.updateMatrixWorld(true);
  }

  heesHawvoos() { this.checkPlayerHit(); }

  checkPlayerHit() {
    if (this._triggered || !this.mesh) return;
    const player = this.olam?.chossid;
    const p = player?.mesh?.position || player?.modelMesh?.position;
    if (!player || !p || player.__spikeDefeated) return;
    if (Math.hypot(p.x - this.mesh.position.x, p.z - this.mesh.position.z) > this.proximity) return;
    const playerBottom = p.y - (Number(player.radius) || 0.45);
    const playerTop = p.y + (Number(player.height) || 1.5);
    const spikeBottom = this.groundY - 0.25;
    const spikeTop = this.groundY + this.verticalHitRange;
    if (playerBottom <= spikeTop && playerTop >= spikeBottom) this.hit(player);
  }

  hit(nivra) {
    if (this._triggered || nivra?.type !== "chossid") return;
    this._triggered = true;
    this.pausePlayer(nivra);
    this.spawnBlockBurst(nivra);
    setTimeout(() => hidePlayer(nivra), 220);
    setTimeout(() => this.showResetOverlay(), 900);
  }

  pausePlayer(nivra) {
    if (!nivra) return;
    nivra.__spikeDefeated = true;
    nivra.moving = {};
    nivra.speed = 0;
    nivra._movementSpeed = 0;
    if (nivra.velocity?.set) nivra.velocity.set(0, 0, 0);
  }

  showResetOverlay() {
    this.olam?.ayshPeula?.("ui event", "effectsOverlay", {
      effect: "spikeDeath",
      text: "נפילה בקוצים — PRESS ANY KEY TO RESET",
      color: "#ff3355",
      overlayDelayMs: 0,
      playProceduralSound: { key: "spikeDeath", options: { volume: 0.5 } }
    });
  }

  spawnBlockBurst(nivra) {
    const scene = this.olam?.scene;
    const origin = nivra?.mesh?.position || nivra?.modelMesh?.position || this.mesh?.position;
    if (!scene || !origin) return;
    const group = new THREE.Group();
    group.name = "Spike_Hit_Block_Burst";
    scene.add(group);
    for (let i = 0; i < 22; i += 1) {
      const cube = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 0.24), new THREE.MeshLambertMaterial({ color: i % 2 ? 0xff3355 : 0xffcc33 }));
      cube.position.set(origin.x, origin.y + 0.8, origin.z);
      cube.userData.vel = new THREE.Vector3(Math.sin(i * 2.41) * 0.2, 0.14 + ((i % 5) * 0.04), Math.cos(i * 1.73) * 0.2);
      cube.name = `אות_${HEBREW[i % HEBREW.length]}_block`;
      group.add(cube);
    }
    let frames = 0;
    const animate = () => {
      frames += 1;
      for (const cube of group.children) {
        cube.position.add(cube.userData.vel);
        cube.userData.vel.y -= 0.008;
        cube.rotation.x += 0.16;
        cube.rotation.y += 0.12;
      }
      if (frames < 90) schedule(animate);
      else scene.remove(group);
    };
    schedule(animate);
  }
}
