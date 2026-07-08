// B"H
/**
 * @file input.js
 * @description
 * Chapter 90: The Worker Receives A Direct Walking Covenant.
 *
 * Key events remain alive, but mobile joystick packets now also set Olam.inputs
 * directly. The log trail names every gate: browser touch, worker message,
 * Olam input, Chossid controls, and physics motion.
 */
import { resolveSpikeResetFeet } from '../../shared/SpikeResetPosition.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

const MOVE_FLAGS = Object.freeze(["FORWARD", "BACKWARD", "LEFT_ROTATE", "RIGHT_ROTATE", "LEFT_STRIDE", "RIGHT_STRIDE", "JUMP", "DOWN", "UP"]);
const MOBILE_MOVE_KEYS = Object.freeze(["FORWARD", "BACKWARD", "LEFT_STRIDE", "RIGHT_STRIDE"]);

function trace(olam, stage, payload = {}) {
  const at = Date.now();
  const active = Array.isArray(payload.active) ? payload.active.length : 0;
  const cadence = active > 0 ? 900 : 2200;
  if (olam.__lastWorkerInputTraceAt && at - olam.__lastWorkerInputTraceAt < cadence) return;
  olam.__lastWorkerInputTraceAt = at;
  olam.__movementTrace ||= [];
  olam.__movementTrace.push({ at, stage, ...payload });
  olam.__movementTrace = olam.__movementTrace.slice(-80);
}
function showTree(obj) { if (!obj) return; obj.visible = true; if (obj.scale?.setScalar) obj.scale.setScalar(1); obj.traverse?.(child => { child.visible = true; if (child.scale?.setScalar) child.scale.setScalar(1); }); }
function currentRunMode(olam) { if (olam?.runMode === "walk") return false; if (olam?.runMode === "run") return true; if (olam?.inputs && Object.prototype.hasOwnProperty.call(olam.inputs, "RUNNING")) return olam.inputs.RUNNING === true; return true; }
function clearMovementButKeepGait(olam, player) { const running = currentRunMode(olam); player.moving = { stridingLeft: false, stridingRight: false, forward: false, backward: false, turningLeft: false, turningRight: false, running, jump: false }; if (olam?.keyStates) Object.keys(olam.keyStates).forEach(key => { olam.keyStates[key] = false; }); olam.inputs = { ...(olam.inputs || {}) }; MOVE_FLAGS.forEach(key => { olam.inputs[key] = false; }); olam.inputs.RUNNING = running; olam.runMode = running ? "run" : "walk"; }
function setPlayerFeet(player, pos) { if (typeof player.setPosition === "function") player.setPosition(pos); else if (player.mesh?.position?.set) player.mesh.position.set(pos.x, pos.y, pos.z); if (player.mesh?.position?.set) player.mesh.position.set(pos.x, pos.y, pos.z); if (player.modelMesh && player.mesh) { if (player.modelMesh.parent === player.mesh) player.modelMesh.position.set(0, Number(player.modelMesh.userData?.visualGroundOffsetY || 0), 0); else { player.modelMesh.position.copy(player.mesh.position); player.modelMesh.position.y += Number(player.modelMesh.userData?.visualGroundOffsetY || 0); } } }
function resetLevelCollectibles(olam) { olam.__perutahResetLock = true; olam.__perutahResetEpoch = Number(olam.__perutahResetEpoch || 0) + 1; olam.__levelPerutosCollected = 0; olam.__tzedakahBlessed = false; let restoredPerutos = 0; olam?.nivrayim?.forEach?.(nivra => { if (nivra?.type !== "coin") return; nivra.resetForLevelRestart?.(); restoredPerutos += 1; }); const payload = { collected: 0, requiredPerutos: olam.requiredPerutos || 0, reset: true, restoredPerutos, silent: true, perutahEpoch: olam.__perutahResetEpoch }; olam?.ayshPeula?.("ui event", "perutahProgress", payload); olam?.ayshPeula?.("ui event", "gameHUD", { perutahProgress: payload }); setTimeout(() => { olam.__perutahResetLock = false; }, 220); return restoredPerutos; }
function resetChossid(olam, data = {}) { const player = olam?.chossid || olam?.nivrayim?.find?.(q => q.type === "chossid"); if (!player) return false; const pos = resolveSpikeResetFeet(data, olam); Object.assign(player, { __spikeDefeated: false, __spikeDeathControlsFrozen: false, __spikeColliderDisabled: false, movingAutomatically: false, onFloor: true }); clearMovementButKeepGait(olam, player); player.velocity?.set?.(0, 0, 0); player.acceleration?.set?.(0, 0, 0); setPlayerFeet(player, pos); const restoredPerutos = resetLevelCollectibles(olam); [player.mesh, player.modelMesh, player.guf, player.visualObject].forEach(showTree); olam.chossid = player; olam.player = player; trace(olam, 'legacy-worker-reset-complete', { pos, restoredPerutos, perutahEpoch: olam.__perutahResetEpoch, runMode: olam.runMode, running: olam.inputs?.RUNNING }); return true; }
function applyMobileMove(olam, data = {}) { if (!olam) return false; olam.inputs ||= {}; MOBILE_MOVE_KEYS.forEach(key => { olam.inputs[key] = data[key] === true; }); olam.__lastMobileMove = { at: Date.now(), ...data }; const active = MOBILE_MOVE_KEYS.filter(key => olam.inputs[key]); trace(olam, 'mobileMove-applied', { active, source: data.source || 'unknown' }); return true; }

export default function inputHandlers(me) {
  return {
    mouseup(e) { if (me.olam) me.olam.ayshPeula("mouseup", e); },
    rightmousedown(e) { if (me.olam) me.olam.ayshPeula("rightmousedown", e); },
    rightmouseup(e) { if (me.olam) me.olam.ayshPeula("rightmouseup", e); },
    mousedown(e) { if (me.olam) me.olam.ayshPeula("mousedown", e); },
    presskey(e) { if (me.olam) me.olam.ayshPeula("presskey", e); },
    keyup(e) { if (me.olam) { trace(me.olam, 'keyup', { code: e?.code, quiet: true }); me.olam.ayshPeula("keyup", e); } },
    keydown(e) { if (me.olam) { trace(me.olam, 'keydown', { code: e?.code }); me.olam.ayshPeula("keydown", e); } },
    mobileMove(e) { return applyMobileMove(me.olam, e || {}); },
    wheel(e) { if (me.olam?.ayin) me.olam.ayshPeula("wheel", e); },
    mousemove(e) { if (me.olam) me.olam.ayshPeula("mousemove", e); },
    resize(e) { if (me.olam) me.olam.ayshPeula("resize", e); },
    resetAfterSpikeDeath(data) { const ok = resetChossid(me.olam, data || {}); me.eved?.postMessage?.({ type: "spikeResetComplete", payload: { ok, perutahEpoch: me.olam?.__perutahResetEpoch, running: me.olam?.inputs?.RUNNING, runMode: me.olam?.runMode } }); },
    cameraDrag(data) { if (me.olam?.ayin && typeof me.olam.ayin.rotateAroundTarget === 'function') me.olam.ayin.rotateAroundTarget(data.dx, data.dy); }
  };
}
