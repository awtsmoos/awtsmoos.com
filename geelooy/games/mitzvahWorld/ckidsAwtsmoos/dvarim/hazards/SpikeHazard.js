// B"H
/**
 * @file SpikeHazard.js
 * @description
 * Chapter 6: The thorn now answers with visible judgment.
 *
 * A spike hit no longer tries to reload from inside the Worker. It makes a
 * small 3D block burst near the Chossid, raises a Hebrew-letter overlay on the
 * main thread, and lets the overlay reload on the next key or click.
 */
import Tzomayach from "../../chayim/tzomayach.js";
import * as THREE from '/games/scripts/build/three.module.js';

const HEBREW = ["א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט", "י", "כ", "ל", "מ"];
const schedule = cb => (typeof requestAnimationFrame === "function" ? requestAnimationFrame(cb) : setTimeout(cb, 16));

export default class SpikeHazard extends Tzomayach {
  type = "spikeHazard";
  static itemName = "Spike Hazard";
  static description = "A verdict thorn. Touching it pauses and asks for reset.";

  constructor(op = {}, olam) {
    op.interactable = true;
    op.proximity ||= 1.65;
    op.golem ||= {
      guf: { ConeGeometry: [op.radius || 0.85, op.height || 1.65, 4] },
      toyr: { MeshLambertMaterial: { color: op.color || 0xcc1133, emissive: 0x550000 } }
    };
    super(op, olam);
    this.penalty = op.penalty || 0;
    this._triggered = false;
    this.heesHawveh = true;

    this.on("ready", () => {
      if (!this.mesh) return;
      this.mesh.rotation.y = Math.PI / 4;
      this.mesh.userData.isSolid = false;
    });
    this.on("nivraNeechnas", nivra => this.hit(nivra));
  }

  heesHawvoos() {
    this.checkPlayerHit();
  }

  checkPlayerHit() {
    if (this._triggered || !this.mesh) return;
    const player = this.olam?.chossid;
    const p = player?.mesh?.position;
    if (!p) return;
    const dx = p.x - this.mesh.position.x;
    const dz = p.z - this.mesh.position.z;
    const dy = Math.abs(p.y - this.mesh.position.y);
    if (Math.hypot(dx, dz) <= (this.proximity || 1.65) && dy < 3.8) this.hit(player);
  }

  hit(nivra) {
    if (this._triggered || nivra?.type !== "chossid") return;
    this._triggered = true;
    this.pausePlayer(nivra);
    this.spawnBlockBurst(nivra);
    this.olam?.ayshPeula?.("ui event", "effectsOverlay", {
      effect: "spikeDeath",
      text: "נפילה בקוצים — PRESS ANY KEY TO RESET",
      color: "#ff3355"
    });
  }

  pausePlayer(nivra) {
    if (!nivra) return;
    nivra.moving = {};
    nivra.speed = 0;
    nivra._movementSpeed = 0;
    if (nivra.velocity?.set) nivra.velocity.set(0, 0, 0);
  }

  spawnBlockBurst(nivra) {
    const scene = this.olam?.scene;
    const origin = nivra?.mesh?.position || this.mesh?.position;
    if (!scene || !origin) return;
    const group = new THREE.Group();
    group.name = "Spike_Hit_Block_Burst";
    scene.add(group);

    for (let i = 0; i < 18; i += 1) {
      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 0.22, 0.22),
        new THREE.MeshLambertMaterial({ color: i % 2 ? 0xff3355 : 0xffcc33 })
      );
      cube.position.set(origin.x, origin.y + 0.8, origin.z);
      cube.userData.vel = new THREE.Vector3(Math.sin(i * 2.41) * 0.18, 0.12 + ((i % 5) * 0.035), Math.cos(i * 1.73) * 0.18);
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
