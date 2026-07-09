// B"H
/**
 * @file SpikeResetActions.js
 * @description
 * Chapter 448: After the spike, the Chossid returns to feet and breath.
 *
 * The Awtsmoos freezes, resets, and revives the player without losing the rooted
 * body. This module owns spike reset physics, collectible reset, and hazard reset
 * so the continuous router can stay small.
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import { resolveSpikeResetFeet } from "../../shared/SpikeResetPosition.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

const MOVE_FLAGS = Object.freeze(["FORWARD", "BACKWARD", "LEFT_ROTATE", "RIGHT_ROTATE", "LEFT_STRIDE", "RIGHT_STRIDE", "JUMP", "DOWN", "UP"]);
const findPlayer = olam => olam?.chossid || olam?.nivrayim?.find?.(q => q.type === "chossid");

function setTreeVisible(root, visible) {
  if (!root) return;
  root.visible = visible;
  root.traverse?.(child => { child.visible = visible; });
}

function currentRunMode(olam) {
  if (olam?.runMode === "walk") return false;
  if (olam?.runMode === "run") return true;
  if (olam?.inputs && Object.prototype.hasOwnProperty.call(olam.inputs, "RUNNING")) return olam.inputs.RUNNING === true;
  return true;
}

function clearInput(olam, player) {
  const running = currentRunMode(olam);
  player.moving = { stridingLeft: false, stridingRight: false, forward: false, backward: false, turningLeft: false, turningRight: false, running, jump: false };
  player.velocity?.set?.(0, 0, 0);
  player.acceleration?.set?.(0, 0, 0);
  if (olam?.keyStates) Object.keys(olam.keyStates).forEach(key => { olam.keyStates[key] = false; });
  olam.inputs = { ...(olam.inputs || {}) };
  MOVE_FLAGS.forEach(key => { olam.inputs[key] = false; });
  olam.inputs.RUNNING = running;
  olam.runMode = running ? "run" : "walk";
}

function stablePlayerFlags(player, frozen) {
  Object.assign(player, {
    __spikeDefeated: frozen, __spikeDeathControlsFrozen: frozen, __spikeColliderDisabled: frozen, __spikeResetCountdown: frozen,
    onFloor: !frozen, isOnGround: !frozen, onGround: !frozen, grounded: !frozen,
    jumped: false, didJump: false, fallingFrames: 0, startedWalking: false, isWalking: false, isTurning: false, movingAutomatically: false
  });
}

function resetPlayerPhysics(player, pos) {
  const feet = new THREE.Vector3(pos.x, pos.y, pos.z);
  if (typeof player.setPosition === "function") player.setPosition(feet);
  player.isTeleporting = false;
  player.velocity?.set?.(0, 0, 0);
  player.acceleration?.set?.(0, 0, 0);
  player.mesh?.position?.set?.(pos.x, pos.y, pos.z);
  player.guf?.position?.set?.(pos.x, pos.y, pos.z);
  player.visualObject?.position?.set?.(pos.x, pos.y, pos.z);
  if (player.modelMesh && player.mesh) {
    if (player.modelMesh.parent === player.mesh) player.modelMesh.position.set(0, Number(player.modelMesh.userData?.visualGroundOffsetY || 0), 0);
    else player.modelMesh.position.copy(player.mesh.position);
    player.modelMesh.rotation.y = Number(player.rotateOffset || 0);
  }
  player.emptyCopy?.position?.copy?.(player.mesh?.position || feet);
  player.nonRotatingEmptyForMovement?.position?.copy?.(player.mesh?.position || feet);
}

function resetHazards(olam) {
  let resetSpikes = 0;
  olam?.nivrayim?.forEach?.(nivra => {
    if (nivra?.type === "spikeHazard") { nivra._triggered = false; nivra._debugNearLogged = false; resetSpikes += 1; }
    if (nivra?.type === "spikeField") { nivra.resetField?.(); resetSpikes += Number(nivra.spikes?.length || 1); }
    if (nivra?.type === "fallResetTrigger") nivra._triggered = false;
  });
  return resetSpikes;
}

function resetLevelCollectibles(olam) {
  olam.__perutahResetLock = true;
  olam.__perutahResetEpoch = Number(olam.__perutahResetEpoch || 0) + 1;
  olam.__levelPerutosCollected = 0;
  olam.__tzedakahBlessed = false;
  let restoredPerutos = 0;
  olam?.nivrayim?.forEach?.(nivra => { if (nivra?.type === "coin") { nivra.resetForLevelRestart?.(); restoredPerutos += 1; } });
  const payload = { collected: 0, requiredPerutos: olam.requiredPerutos || 0, reset: true, restoredPerutos, silent: true, perutahEpoch: olam.__perutahResetEpoch };
  olam?.ayshPeula?.("ui event", "perutahProgress", payload);
  olam?.ayshPeula?.("ui event", "gameHUD", { perutahProgress: payload });
  setTimeout(() => { olam.__perutahResetLock = false; }, 220);
  return restoredPerutos;
}

function revealPlayerRoots(player) {
  [player.mesh, player.modelMesh, player.guf, player.visualObject, player.emptyCopy, player.nonRotatingEmptyForMovement].forEach(root => setTreeVisible(root, true));
  player.updateAppearance?.();
  player.playChaweeyoos?.(player.getChaweeyoos?.("idle"));
}

function revivePlayer(olam, player) {
  olam.__spikeDeathActive = false;
  stablePlayerFlags(player, false);
  clearInput(olam, player);
  revealPlayerRoots(player);
  olam.chossid = player;
  olam.player = player;
}

export function resetAfterSpikeDeath(olam, payload = {}) {
  const player = findPlayer(olam);
  const pos = resolveSpikeResetFeet(payload, olam);
  if (!player) return void self.postMessage({ type: "spikeResetComplete", payload: { ok: false, reason: "missing-player" } });
  olam.__spikeDeathToken = (olam.__spikeDeathToken || 0) + 1;
  player.__spikeDeathToken = olam.__spikeDeathToken;
  revivePlayer(olam, player);
  resetPlayerPhysics(player, pos);
  const restoredPerutos = resetLevelCollectibles(olam);
  const resetSpikes = resetHazards(olam);
  self.postMessage({ type: "spikeResetComplete", payload: { ok: true, pos, resetSpikes, restoredPerutos, perutahEpoch: olam.__perutahResetEpoch, colliderDisabled: false, running: olam.inputs?.RUNNING, runMode: olam.runMode, token: olam.__spikeDeathToken } });
}

export function enableAfterSpikeReset(olam) {
  const player = findPlayer(olam);
  if (!player) return void self.postMessage({ type: "spikeEnableComplete", payload: { ok: false, reason: "missing-player" } });
  revivePlayer(olam, player);
  resetLevelCollectibles(olam);
  resetHazards(olam);
  self.postMessage({ type: "spikeEnableComplete", payload: { ok: true, colliderDisabled: false, perutahEpoch: olam.__perutahResetEpoch, running: olam.inputs?.RUNNING, runMode: olam.runMode, token: olam.__spikeDeathToken } });
}
