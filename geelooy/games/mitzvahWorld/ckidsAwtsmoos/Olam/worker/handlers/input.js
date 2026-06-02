// B"H
/**
 * @file input.js
 * @description
 * Chapter 89: Legacy Reset Also Stamped The Epoch.
 *
 * Older reset messages now zero the counter, restore perutos, and stamp the HUD
 * with the same perutah epoch used by the modern continuous event router.
 */
const START_FEET = Object.freeze({ x: -10.5, y: 0.425, z: 0 });
const MOVE_FLAGS = Object.freeze(["FORWARD", "BACKWARD", "LEFT_ROTATE", "RIGHT_ROTATE", "LEFT_STRIDE", "RIGHT_STRIDE", "JUMP", "DOWN", "UP"]);

function showTree(obj) {
  if (!obj) return;
  obj.visible = true;
  if (obj.scale?.setScalar) obj.scale.setScalar(1);
  obj.traverse?.(child => { child.visible = true; if (child.scale?.setScalar) child.scale.setScalar(1); });
}

function currentRunMode(olam) {
  if (olam?.runMode === "walk") return false;
  if (olam?.runMode === "run") return true;
  if (olam?.inputs && Object.prototype.hasOwnProperty.call(olam.inputs, "RUNNING")) return olam.inputs.RUNNING === true;
  return true;
}

function clearMovementButKeepGait(olam, player) {
  const running = currentRunMode(olam);
  player.moving = { stridingLeft: false, stridingRight: false, forward: false, backward: false, turningLeft: false, turningRight: false, running, jump: false };
  if (olam?.keyStates) Object.keys(olam.keyStates).forEach(key => { olam.keyStates[key] = false; });
  olam.inputs = { ...(olam.inputs || {}) };
  MOVE_FLAGS.forEach(key => { olam.inputs[key] = false; });
  olam.inputs.RUNNING = running;
  olam.runMode = running ? "run" : "walk";
}

function setPlayerFeet(player, pos) {
  if (typeof player.setPosition === "function") player.setPosition(pos);
  else if (player.mesh?.position?.set) player.mesh.position.set(pos.x, pos.y, pos.z);
  if (player.mesh?.position?.set) player.mesh.position.set(pos.x, pos.y, pos.z);
  if (player.modelMesh && player.mesh) {
    player.modelMesh.position.copy(player.mesh.position);
    player.modelMesh.position.y += Number(player.modelMesh.userData?.visualGroundOffsetY || 0);
  }
}

function resetLevelCollectibles(olam) {
  olam.__perutahResetLock = true;
  olam.__perutahResetEpoch = Number(olam.__perutahResetEpoch || 0) + 1;
  olam.__levelPerutosCollected = 0;
  olam.__tzedakahBlessed = false;
  let restoredPerutos = 0;
  olam?.nivrayim?.forEach?.(nivra => {
    if (nivra?.type !== "coin") return;
    nivra.resetForLevelRestart?.();
    restoredPerutos += 1;
  });
  const payload = { collected: 0, requiredPerutos: olam.requiredPerutos || 0, reset: true, restoredPerutos, silent: true, perutahEpoch: olam.__perutahResetEpoch };
  olam?.ayshPeula?.("ui event", "perutahProgress", payload);
  olam?.ayshPeula?.("ui event", "gameHUD", { perutahProgress: payload });
  setTimeout(() => { olam.__perutahResetLock = false; }, 220);
  return restoredPerutos;
}

function resetChossid(olam, data = {}) {
  const player = olam?.chossid || olam?.nivrayim?.find?.(q => q.type === "chossid");
  if (!player) return false;
  const pos = { ...START_FEET, ...(data.position || {}) };
  Object.assign(player, { __spikeDefeated: false, __spikeDeathControlsFrozen: false, __spikeColliderDisabled: false, movingAutomatically: false, onFloor: true });
  clearMovementButKeepGait(olam, player);
  player.velocity?.set?.(0, 0, 0);
  player.acceleration?.set?.(0, 0, 0);
  setPlayerFeet(player, pos);
  const restoredPerutos = resetLevelCollectibles(olam);
  [player.mesh, player.modelMesh, player.guf, player.visualObject].forEach(showTree);
  olam.chossid = player;
  olam.player = player;
  console.info('B"H | SPIKE_RESET_TRACE', { stage: 'legacy-worker-reset-complete', pos, restoredPerutos, perutahEpoch: olam.__perutahResetEpoch, runMode: olam.runMode, running: olam.inputs?.RUNNING });
  return true;
}

export default function inputHandlers(me) {
  return {
    mouseup(e) { if (me.olam) me.olam.ayshPeula("mouseup", e); },
    rightmousedown(e) { if (me.olam) me.olam.ayshPeula("rightmousedown", e); },
    rightmouseup(e) { if (me.olam) me.olam.ayshPeula("rightmouseup", e); },
    mousedown(e) { if (me.olam) me.olam.ayshPeula("mousedown", e); },
    presskey(e) { if (me.olam) me.olam.ayshPeula("presskey", e); },
    keyup(e) { if (me.olam) me.olam.ayshPeula("keyup", e); },
    keydown(e) { if (me.olam) me.olam.ayshPeula("keydown", e); },
    wheel(e) { if (me.olam?.ayin) me.olam.ayshPeula("wheel", e); },
    mousemove(e) { if (me.olam) me.olam.ayshPeula("mousemove", e); },
    resize(e) { if (me.olam) me.olam.ayshPeula("resize", e); },
    resetAfterSpikeDeath(data) { const ok = resetChossid(me.olam, data || {}); me.eved?.postMessage?.({ type: "spikeResetComplete", payload: { ok, perutahEpoch: me.olam?.__perutahResetEpoch, running: me.olam?.inputs?.RUNNING, runMode: me.olam?.runMode } }); },
    cameraDrag(data) { if (me.olam?.ayin && typeof me.olam.ayin.rotateAroundTarget === 'function') me.olam.ayin.rotateAroundTarget(data.dx, data.dy); }
  };
}
