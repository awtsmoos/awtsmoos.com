// B"H
/**
 * @file CoinMimicHazard.js
 * @description
 * Chapter 213: A copper perutah that lies.
 *
 * The Awtsmoos permits a lesson in discernment: this hazard now looks almost
 * exactly like a true glowing perutah, but collision routes through SpikeHazard.
 * Level authors can hide judgment among reward without creating a new system.
 */
import SpikeHazard from "./SpikeHazard.js";

export default class CoinMimicHazard extends SpikeHazard {
  type = "coinMimicHazard";
  static itemName = "Coin Mimic";

  constructor(op = {}, olam) {
    op.radius = op.radius || 0.58;
    op.height = op.height || 0.13;
    op.manualHitRadius = op.manualHitRadius || 0.68;
    op.proximity = 0;
    op.penalty = op.penalty || 7;
    op.groundY = Number.isFinite(op.groundY) ? op.groundY : Number(op.position?.y || 1.3) - 0.07;
    op.golem = op.golem || {
      guf: { CylinderGeometry: [0.58, 0.58, 0.13, 40, 1] },
      toyr: { MeshStandardMaterial: { color: 0xe09a4d, emissive: 0x8a3b10, emissiveIntensity: 0.78, metalness: 0.9, roughness: 0.18 } }
    };
    super(op, olam);
    this.rotationSpeed = op.rotationSpeed || 0.05;
    this.heesHawveh = true;
  }

  afterReadyGrounding() {
    super.afterReadyGrounding();
    if (!this.mesh) return;
    this.mesh.rotation.z = Math.PI / 2;
    this.mesh.userData.coinMimicHazard = true;
  }

  heesHawvoos() {
    if (this.mesh) this.mesh.rotation.y += this.rotationSpeed;
    super.heesHawvoos();
  }
}
