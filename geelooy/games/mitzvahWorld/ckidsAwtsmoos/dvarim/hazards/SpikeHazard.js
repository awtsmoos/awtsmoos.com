// B"H
/**
 * @file SpikeHazard.js
 * @description
 * Chapter 36: Thorn collision receives its own spatial grid.
 *
 * The Awtsmoos does not let 1,800 red teeth ask the same question every frame.
 * Each spike registers once into a coarse grid. Once per frame, the Chossid's
 * current cell awakens only the nearby thorn vessels; all other spikes return
 * after one Set lookup. This is separate from the static world octree and tuned
 * for dynamic hazard life.
 */
import Tzomayach from "../../chayim/tzomayach.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
const LOG = 'B"H | SPIKE_DEATH_TRACE';
const FEET_PAD = 0.18;
const HORIZONTAL_RADIUS = 0.86;
const CELL = 3.5;
const grid = new Map();
let activeSet = new Set();
let frameMark = -1;
const now = () => Math.round(globalThis.performance?.now?.() || Date.now());
const cellKey = (x, z) => `${Math.floor(x / CELL)},${Math.floor(z / CELL)}`;
function log(stage, extra = {}) {
  const payload = { stage, at: now(), ...extra };
  console.info(LOG, payload);
  try { globalThis.postMessage?.({ type: "worker_text_log", payload: `SPIKE_DEATH_TRACE ${JSON.stringify(payload)}` }); } catch {}
}
function addToGrid(spike) {
  const p = spike.mesh?.position || spike.position;
  if (!p) return;
  const key = cellKey(p.x, p.z);
  if (!grid.has(key)) grid.set(key, new Set());
  grid.get(key).add(spike);
}
function refreshActive(player, frame) {
  if (!player || frame === frameMark) return;
  frameMark = frame;
  const p = player.mesh?.position || player.modelMesh?.position;
  if (!p) return;
  const cx = Math.floor(p.x / CELL);
  const cz = Math.floor(p.z / CELL);
  const next = new Set();
  for (let x = cx - 1; x <= cx + 1; x += 1) {
    for (let z = cz - 1; z <= cz + 1; z += 1) {
      const bucket = grid.get(`${x},${z}`);
      if (bucket) bucket.forEach(spike => next.add(spike));
    }
  }
  activeSet = next;
}
function setRootVisible(obj, visible) { if (obj) obj.visible = visible; }
function maybeHidePlayer(nivra, token) {
  if (!nivra?.__spikeDeathControlsFrozen || nivra.__spikeDeathToken !== token) return log("player:hide-cancelled", { token });
  setRootVisible(nivra.modelMesh, false);
  setRootVisible(nivra.visualObject, false);
  setRootVisible(nivra.guf, false);
  setRootVisible(nivra.mesh, false);
  log("player:hidden-roots-only", { token, colliderDisabled: Boolean(nivra.__spikeColliderDisabled) });
}
function sendMainOverlay(payload) {
  try { globalThis.postMessage?.({ type: "forceSpikeResetOverlay", payload }); log("overlay:direct-posted", { reason: payload.reason, token: payload.token }); }
  catch (error) { log("overlay:direct-post-failed", { message: error?.message || String(error), token: payload.token }); }
}
function playerFeetY(player) {
  if (player?.collider?.start) return player.collider.start.y - (Number(player.radius) || 0.45);
  const p = player?.mesh?.position || player?.modelMesh?.position;
  return Number.isFinite(p?.y) ? p.y - (Number(player.radius) || 0.45) : NaN;
}
export default class SpikeHazard extends Tzomayach {
  type = "spikeHazard";
  static itemName = "Spike Hazard";
  static description = "A gridded manual-foot thorn with worker-safe contact.";
  constructor(op = {}, olam) {
    op.interactable = false;
    op.proximity = 0;
    op.isSolid = false;
    op.groundY = Number.isFinite(op.groundY) ? op.groundY : -3;
    op.height = Number.isFinite(op.height) ? op.height : 1.65;
    op.golem ||= { guf: { ConeGeometry: [op.radius || 1.1, op.height, 4] }, toyr: { MeshStandardMaterial: { color: 0xff2636, emissive: 0x991000, roughness: 0.82, metalness: 0.04, flatShading: true } } };
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
    addToGrid(this);
  }
  heesHawvoos() {
    const player = this.olam?.chossid;
    refreshActive(player, this.olam?.frame || Math.floor(now() / 16));
    if (!activeSet.has(this)) return;
    this.checkManualPlayerHit(player);
  }
  checkManualPlayerHit(player = this.olam?.chossid) {
    if (this._triggered || this.olam?.__spikeDeathActive || !this.mesh) return;
    if (!player || player.__spikeDefeated || player.__spikeDeathControlsFrozen || player.__spikeColliderDisabled) return;
    const p = player.mesh?.position || player.modelMesh?.position;
    const s = this.mesh.position;
    if (!p || !s) return;
    const radius = this.manualHitRadius;
    const dx = p.x - s.x;
    if (dx > radius || dx < -radius) return;
    const dz = p.z - s.z;
    if (dz > radius || dz < -radius) return;
    const feetY = playerFeetY(player);
    if (!Number.isFinite(feetY)) return;
    const topY = this.groundY + this.height;
    const footContact = feetY <= topY + FEET_PAD && feetY >= this.groundY - 0.35;
    const nearHoriz = dx * dx + dz * dz <= radius * radius;
    if (nearHoriz && footContact) this.hit(player, "grid-foot-contact", { dx, dz, feetY, topY });
  }
  hit(nivra, source = "unknown", metrics = {}) {
    if (this._triggered || nivra?.type !== "chossid") return;
    if (nivra.__spikeDefeated || nivra.__spikeDeathControlsFrozen || nivra.__spikeColliderDisabled || this.olam?.__spikeDeathActive) return;
    this._triggered = true;
    this.olam.__spikeDeathActive = true;
    const token = (this.olam.__spikeDeathToken || 0) + 1;
    this.olam.__spikeDeathToken = token;
    nivra.__spikeDeathToken = token;
    log("hit:claimed-single-death", { token, source, spike: this.name, activeSpikes: activeSet.size, ...metrics });
    this.disablePlayerSystems(nivra, token);
    this.requestOverlay("grid-foot-contact", nivra, token);
    setTimeout(() => maybeHidePlayer(nivra, token), 120);
  }
  disablePlayerSystems(nivra, token) {
    Object.assign(nivra, { __spikeDefeated: true, __spikeDeathControlsFrozen: true, __spikeColliderDisabled: true, __spikeResetCountdown: false, moving: {} });
    nivra.velocity?.set?.(0, 0, 0);
    nivra.acceleration?.set?.(0, 0, 0);
    log("collider:disabled-immediately", { token, hasCollider: Boolean(nivra.collider) });
  }
  requestOverlay(reason, nivra, token) {
    const p = nivra?.mesh?.position || nivra?.modelMesh?.position;
    const payload = { effect: "spikeDeath", reason, token, cssOnly: true, text: "נפילה בקוצים — PRESS ANY KEY TO RESET", color: "#ff3355", resetPath: "ladder-1.jsonon", worldPosition: p ? { x: p.x, y: p.y, z: p.z } : null };
    sendMainOverlay(payload);
    try { this.olam?.ayshPeula?.("ui event", "effectsOverlay", payload); }
    catch (error) { log("overlay:ui-event-failed", { reason, token, message: error?.message || String(error) }); }
  }
}
