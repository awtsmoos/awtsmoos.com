// B"H
import { resolveCutscenesForEvent, markResolvedCutscenesSeen } from "../../../systems/cutscene/CutsceneTriggerResolver.js";
import { targetHudPayload } from "../targeting/TargetingHudBridge.js";
import { nearestTarget } from "../targeting/TargetClassifier.js";

const n = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export class CollisionMovementBridge {
  constructor(olam = {}, bridge = olam.__collisionLiveBridge, options = {}) {
    this.olam = olam; this.bridge = bridge; this.radius = options.radius || 0.55;
    this.inputLocked = false; this.lastTargetPayload = null; this.events = [];
    this.worldSource = options.worldSource || bridge?.data || {}; this.holder = options.holder || olam;
    olam.__collisionMovementBridge = this;
  }
  player() { return this.olam.player || this.olam.chossid || {}; }
  pos() { return this.player().mesh?.position || this.player().position || { x:0, z:0 }; }
  emit(name, payload) { this.events.push({ name, payload }); this.olam?.ayshPeula?.("ui event", name, payload); return payload; }
  setInputLocked(value, reason = "manual") { this.inputLocked = Boolean(value); this.olam.__inputLocked = this.inputLocked; this.emit("inputLock", { locked:this.inputLocked, reason }); return this.inputLocked; }
  step(delta = {}, dt = 1 / 60) {
    const before = this.pos(), wanted = this.inputLocked ? { x:0, z:0 } : normalize(delta, n(dt, 1 / 60));
    const moved = this.bridge.world.moveCircle(before, wanted, this.radius);
    before.x = moved.position.x; before.z = moved.position.z;
    const triggerEvents = this.bridge.triggers.update(this.player().id || "player", moved.position, this.radius);
    triggerEvents.forEach(event => this.handleTrigger(event));
    const target = nearestTarget(this.bridge.entities || [], { playerPosition:moved.position });
    this.emitTargetIfChanged(target, moved.position);
    return { ...moved, triggerEvents, inputLocked:this.inputLocked, target };
  }
  handleTrigger(event) {
    this.emit(event.type, { triggerId:event.triggerId, kind:event.kind });
    const body = event.body, doorId = body?.data?.doorId || body?.data?.id;
    if (event.type === "triggerEnter" && body?.kind === "door-trigger") this.emit(body.data?.locked ? "doorDenied" : "doorAccepted", { doorId });
    this.resolveCutscenes(event.type === "triggerEnter" ? "collisionEnter" : "collisionExit", { triggerId:event.triggerId, doorId });
  }
  resolveCutscenes(type, extra = {}) {
    const found = resolveCutscenesForEvent({ type, ...extra, worldId:this.worldSource.worldId }, this.worldSource, this.holder);
    if (!found.resolved.length) return found;
    this.setInputLocked(true, `cutscene:${type}`);
    this.emit("cutsceneStart", { ids:found.resolved.map(t => t.id), type });
    for (const t of found.resolved) for (const beat of t.beats || []) this.emit("cutsceneBeat", { cutsceneId:t.id, ...beat });
    markResolvedCutscenesSeen(this.holder, found.resolved);
    this.emit("cutsceneFinish", { ids:found.resolved.map(t => t.id), type });
    this.setInputLocked(false, `cutscene:${type}:finished`);
    return found;
  }
  enterWorld(worldId = this.worldSource.worldId || "village") { return this.resolveCutscenes("enterWorld", { worldId }); }
  emitTargetIfChanged(target, position) {
    const payload = targetHudPayload(target, { playerPosition:position, range:12 });
    if (same(payload, this.lastTargetPayload)) return null;
    this.lastTargetPayload = payload;
    return this.emit("targetHud", payload);
  }
}

function normalize(delta, dt) {
  const x = n(delta.x), z = n(delta.z), len = Math.hypot(x, z);
  if (!len) return { x:0, z:0 };
  const speed = n(delta.speed, 6) * dt;
  return { x:x / len * speed, z:z / len * speed };
}

export default CollisionMovementBridge;
