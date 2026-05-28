// B"H
/**
 * @file input.js
 * @description
 * Chapter 19: The reset is no longer a world-reload flood.
 *
 * The Awtsmoos keeps the already-born world alive. When the thorn has frozen
 * the Chossid, the overlay sends `resetAfterSpikeDeath`; this handler restores
 * the same player vessel to the first platform, shows its mesh, clears velocity,
 * and lets controls breathe again.
 */
const START = Object.freeze({ x: -8, y: 5, z: 0 });

function showTree(obj) {
  if (!obj) return;
  obj.visible = true;
  if (obj.scale?.setScalar) obj.scale.setScalar(1);
  if (obj.traverse) obj.traverse(child => {
    child.visible = true;
    if (child.scale?.setScalar) child.scale.setScalar(1);
  });
}

function setPosition(obj, pos) {
  if (obj?.position?.set) obj.position.set(pos.x, pos.y, pos.z);
  else if (obj?.position) Object.assign(obj.position, pos);
}

function resetChossid(olam, data = {}) {
  const player = olam?.chossid || olam?.nivrayim?.find?.(q => q.type === "chossid");
  if (!player) return false;
  const pos = { ...START, ...(data.position || {}) };
  player.__spikeDefeated = false;
  player.__spikeDeathControlsFrozen = false;
  player.moving = {};
  if (player.velocity?.set) player.velocity.set(0, 0, 0);
  if (player.acceleration?.set) player.acceleration.set(0, 0, 0);
  setPosition(player.mesh, pos);
  setPosition(player.modelMesh, pos);
  setPosition(player.guf, pos);
  setPosition(player.visualObject, pos);
  showTree(player.mesh);
  showTree(player.modelMesh);
  showTree(player.guf);
  showTree(player.visualObject);
  olam.chossid = player;
  olam.keyStates = {};
  olam.inputs = { ...(olam.inputs || {}) };
  console.info('B"H | SPIKE_RESET_TRACE', { stage: 'worker-reset-complete', pos });
  olam.ayshPeula?.("ui event", "effectsOverlay", { effect: "spikeResetDone", text: "Reset", color: "#76ff8a" });
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

    /** Restores the already-loaded Chossid to the first platform. */
    resetAfterSpikeDeath(data) {
      const ok = resetChossid(me.olam, data || {});
      me.eved?.postMessage?.({ type: "spikeResetComplete", payload: { ok } });
    },

    /** High-speed rotation from swipe signals. */
    cameraDrag(data) {
      if (me.olam?.ayin && typeof me.olam.ayin.rotateAroundTarget === 'function') {
        me.olam.ayin.rotateAroundTarget(data.dx, data.dy);
      }
    }
  };
}
