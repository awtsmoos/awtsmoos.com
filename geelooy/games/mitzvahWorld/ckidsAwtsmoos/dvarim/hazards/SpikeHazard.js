// B"H
/**
 * @file SpikeHazard.js
 * @description Chapter 24: Spikes leave the generic proximity universe.
 *
 * The Awtsmoos exposed the hidden blade: `Tzomayach` proximity was firing
 * `nivraNeechnas` while the Chossid merely passed near or above spikes. A hazard
 * is not a shop, not a door, not an NPC. It must not live in the interactable
 * proximity registry. This class now sets `interactable=false`, `proximity=0`,
 * never subscribes to `nivraNeechnas`, and checks only a tight foot/capsule band
 * in its own lightweight heartbeat.
 *
 * One fall. One death gate. No Three explosion. No proximity death.
 */
import Tzomayach from "../../chayim/tzomayach.js";

const LOG = 'B"H | SPIKE_DEATH_TRACE';
const FEET_PAD = 0.18;
const HORIZONTAL_RADIUS = 0.92;
const now = () => Math.round(globalThis.performance?.now?.() || Date.now());

function log(stage, extra = {}) {
  const payload = { stage, at: now(), ...extra };
  console.info(LOG, payload);
  try { globalThis.postMessage?.({ type: "worker_text_log", payload: `SPIKE_DEATH_TRACE ${JSON.stringify(payload)}` }); } catch {}
}

function hideTree(obj) {
  if (!obj) return;
  obj.visible = false;
  if (obj.scale?.setScalar) obj.scale.setScalar(0.001);
  if (obj.traverse) obj.traverse(child => {
    child.visible = false;
    if (child.scale?.setScalar) child.scale.setScalar(0.001);
  });
}

function maybeHidePlayer(nivra, token) {
  if (!nivra?.__spikeDeathControlsFrozen || nivra.__spikeDeathToken !== token) return log("player:hide-cancelled", { token });
  hideTree(nivra.mesh);
  hideTree(nivra.modelMesh);
  hideTree(nivra.guf);
  hideTree(nivra.visualObject);
  if (nivra.mesh?.position) nivra.mesh.position.y = -999;
  if (nivra.modelMesh?.position) nivra.modelMesh.position.y = -999;
  log("player:hidden", { token });
}

function sendMainOverlay(payload) {
  try {
    globalThis.postMessage?.({ type: "forceSpikeResetOverlay", payload });
    log("overlay:direct-posted", { reason: payload.reason, token: payload.token });
  } catch (error) {
    log("overlay:direct-post-failed", { message: error?.message || String(error), token: payload.token });
  }
}

function playerFeetY(player) {
  if (player?.collider?.start) return player.collider.start.y - (Number(player.radius) || 0.45);
  const p = player?.mesh?.position || player?.modelMesh?.position;
  return Number.isFinite(p?.y) ? p.y - (Number(player.radius) || 0.45) : NaN;
}

function horizontalDistance(player, spikeMesh) {
  const p = player?.mesh?.position || player?.modelMesh?.position;
  if (!p || !spikeMesh?.position) return Infinity;
  return Math.hypot(p.x - spikeMesh.position.x, p.z - spikeMesh.position.z);
}

export default class SpikeHazard extends Tzomayach {
  type = "spikeHazard";
  static itemName = "Spike Hazard";
  static description = "A grounded thorn with manual foot contact only.";

  constructor(op = {}, olam) {
    op.interactable = false;
    op.proximity = 0;
    op.isSolid = false;
    op.groundY = Number.isFinite(op.groundY) ? op.groundY : -3;
    op.height = Number.isFinite(op.height) ? op.height : 1.65;
    op.golem ||= {
      guf: { ConeGeometry: [op.radius || 1.1, op.height, 4] },
      toyr: { MeshStandardMaterial: { color: 0xff2233, emissive: 0xaa1100, roughness: 0.7, metalness: 0.1 } }
    };
    super(op, olam);
    this.groundY = op.groundY;
    this.height = op.height;
    this.manualHitRadius = Number.isFinite(op.manualHitRadius) ? op.manualHitRadius : HORIZONTAL_RADIUS;
    this._triggered = false;
    this._debugNearLogged = false;
    this.heesHawveh = true;
    this.on("ready", () => this.afterReadyGrounding());
  }

  afterReadyGrounding() {
    if (!this.mesh) return;
    this.proximity = 0;
    this.objectsCollidingWith = [];
    this.mesh.rotation.y = Math.PI / 4;
    this.mesh.userData.isSolid = false;
    this.mesh.userData.addToOctree = false;
    this.mesh.userData.skipRaycast = true;
    const centerY = this.groundY + this.height / 2;
    this.mesh.position.y = centerY;
    this.position ||= {};
    this.position.y = centerY;
    this.mesh.updateMatrixWorld(true);
  }

  heesHawvoos() { this.checkManualPlayerHit(); }

  checkManualPlayerHit() {
    if (this._triggered || this.olam?.__spikeDeathActive || !this.mesh) return;
    const player = this.olam?.chossid;
    if (!player || player.__spikeDefeated || player.__spikeDeathControlsFrozen) return;
    const feetY = playerFeetY(player);
    if (!Number.isFinite(feetY)) return;
    const dxz = horizontalDistance(player, this.mesh);
    const topY = this.groundY + this.height;
    const nearHoriz = dxz <= this.manualHitRadius;
    const footContact = feetY <= topY + FEET_PAD && feetY >= this.groundY - 0.35;

    if (nearHoriz && !footContact && !this._debugNearLogged) {
      this._debugNearLogged = true;
      log("near-but-not-contact", { name: this.name, dxz: Number(dxz.toFixed(3)), feetY: Number(feetY.toFixed(3)), topY });
    }
    if (nearHoriz && footContact) this.hit(player, "manual-foot-contact", { dxz, feetY, topY });
  }

  hit(nivra, source = "unknown", metrics = {}) {
    if (this._triggered) return log("hit:ignored-spike-already-triggered", { source });
    if (nivra?.type !== "chossid") return;
    if (nivra.__spikeDefeated || nivra.__spikeDeathControlsFrozen || this.olam?.__spikeDeathActive) {
      return log("hit:ignored-global-death-active", { source, olamActive: Boolean(this.olam?.__spikeDeathActive), playerDefeated: Boolean(nivra.__spikeDefeated) });
    }

    this._triggered = true;
    this.olam.__spikeDeathActive = true;
    const token = (this.olam.__spikeDeathToken || 0) + 1;
    this.olam.__spikeDeathToken = token;
    nivra.__spikeDeathToken = token;
    log("hit:claimed-single-death", { token, source, spike: this.name, ...metrics });
    this.freezeControlsOnly(nivra, token);
    this.requestOverlay("manual-foot-contact", nivra, token);
    setTimeout(() => maybeHidePlayer(nivra, token), 120);
    setTimeout(() => {
      if (this.olam?.__spikeDeathActive && this.olam.__spikeDeathToken === token) this.requestOverlay("watchdog-350ms", nivra, token);
    }, 350);
  }

  freezeControlsOnly(nivra, token) {
    nivra.__spikeDefeated = true;
    nivra.__spikeDeathControlsFrozen = true;
    nivra.moving = {};
    if (nivra.velocity?.set) nivra.velocity.set(0, 0, 0);
    log("controls:frozen-only", { token });
  }

  requestOverlay(reason, nivra, token) {
    const p = nivra?.mesh?.position || nivra?.modelMesh?.position;
    const payload = {
      effect: "spikeDeath",
      reason,
      token,
      cssOnly: true,
      text: "נפילה בקוצים — PRESS ANY KEY TO RESET",
      color: "#ff3355",
      resetPath: "ladder-1.js",
      worldPosition: p ? { x: p.x, y: p.y, z: p.z } : null
    };
    sendMainOverlay(payload);
    try {
      this.olam?.ayshPeula?.("ui event", "effectsOverlay", payload);
      log("overlay:ui-event-requested", { reason, token });
    } catch (error) {
      log("overlay:ui-event-failed", { reason, token, message: error?.message || String(error) });
    }
  }
}
