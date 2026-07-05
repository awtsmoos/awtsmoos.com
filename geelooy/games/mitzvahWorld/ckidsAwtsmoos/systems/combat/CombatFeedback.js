// B"H
/** @file CombatFeedback.js @description Small visual and UI feedback helpers. */
export function flashTarget(mesh, color = 0xffaa33) {
  mesh?.traverse?.(child => {
    if (child.material?.emissive) child.material.emissive.setHex(color);
  });
  setTimeout(() => mesh?.traverse?.(child => child.material?.emissive?.setHex?.(0x000000)), 110);
}

export function emitCombatFeedback(olam, text, color = "#ffd966") {
  olam?.ayshPeula?.("ui event", "effectsOverlay", { text, color });
  olam?.ayshPeula?.("ui event", "floatingCombatText", { text, color });
}

export default { flashTarget, emitCombatFeedback };
