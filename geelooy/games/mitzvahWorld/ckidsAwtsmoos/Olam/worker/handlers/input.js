// B"H
/**
 * @file input.js
 * @description
 * Chapter 30: Legacy Reset Also Learned Feet.
 *
 * Some routes still carry older input-handler messages. If they receive a lava
 * reset, they now use feet-on-ground Y and call the player's own setPosition so
 * the capsule does not come back as a center-based ghost.
 */
const START_FEET = Object.freeze({ x: -10.5, y: 0.425, z: 0 });

/** @param {object} obj Object3D-like root. */
function showTree(obj) {
  if (!obj) return;
  obj.visible = true;
  if (obj.scale?.setScalar) obj.scale.setScalar(1);
  if (obj.traverse) obj.traverse(child => { child.visible = true; if (child.scale?.setScalar) child.scale.setScalar(1); });
}

/** @param {object} player Player entity. @param {{x:number,y:number,z:number}} pos Feet position. */
function setPlayerFeet(player, pos) {
  if (typeof player.setPosition === "function") player.setPosition(pos);
  else if (player.mesh?.position?.set) player.mesh.position.set(pos.x, pos.y, pos.z);
  if (player.mesh?.position?.set) player.mesh.position.set(pos.x, pos.y, pos.z);
  if (player.modelMesh && player.mesh) {
    player.modelMesh.position.copy(player.mesh.position);
    player.modelMesh.position.y += Number(player.modelMesh.userData?.visualGroundOffsetY || 0);
  }
}

/** @param {object} olam World. @param {object} data Reset payload. @returns {boolean} */
function resetChossid(olam, data = {}) {
  const player = olam?.chossid || olam?.nivrayim?.find?.(q => q.type === "chossid");
  if (!player) return false;
  const pos = { ...START_FEET, ...(data.position || {}) };
  Object.assign(player, { __spikeDefeated: false, __spikeDeathControlsFrozen: false, __spikeColliderDisabled: false, movingAutomatically: false, onFloor: true });
  player.moving = {};
  player.velocity?.set?.(0, 0, 0);
  player.acceleration?.set?.(0, 0, 0);
  setPlayerFeet(player, pos);
  [player.mesh, player.modelMesh, player.guf, player.visualObject].forEach(showTree);
  olam.chossid = player;
  olam.player = player;
  olam.keyStates = {};
  olam.inputs = { ...(olam.inputs || {}) };
  console.info('B"H | SPIKE_RESET_TRACE', { stage: 'legacy-worker-reset-complete', pos });
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
    resetAfterSpikeDeath(data) { const ok = resetChossid(me.olam, data || {}); me.eved?.postMessage?.({ type: "spikeResetComplete", payload: { ok } }); },
    cameraDrag(data) { if (me.olam?.ayin && typeof me.olam.ayin.rotateAroundTarget === 'function') me.olam.ayin.rotateAroundTarget(data.dx, data.dy); }
  };
}
