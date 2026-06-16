// B"H
/** Enter/exit covenant: press E and the road receives the player. */
export function installVehicleInteraction(state) {
  const keys = state.keys = {};
  const ui = document.createElement("div");
  ui.id = "mitzvahVehiclePrompt";
  ui.style.cssText = "position:fixed;left:50%;bottom:110px;transform:translateX(-50%);z-index:9200;padding:10px 14px;border:1px solid #ffd966;border-radius:10px;background:rgba(5,8,20,.86);color:#fff3c4;font:700 14px system-ui;display:none";
  document.body.appendChild(ui);
  addEventListener("keydown", e => { keys[e.code] = true; if (e.code === "KeyE") toggleSeat(state); });
  addEventListener("keyup", e => { keys[e.code] = false; });
  state.prompt = ui;
}

export function updateVehicleInteraction(state) {
  const v = nearestVehicle(state);
  state.nearVehicle = v;
  if (!state.prompt) return;
  if (!state.activeVehicle && v) {
    const verb = v.vehicleType === "car" ? "Drive" : v.vehicleType === "cart" ? "Enter Wagon" : "Ride";
    state.prompt.textContent = `Press E to ${verb} · ${v.customName || v.name}`;
    state.prompt.style.display = "block";
  } else if (state.activeVehicle) {
    state.prompt.textContent = "Press E to Exit Vehicle";
    state.prompt.style.display = "block";
  } else state.prompt.style.display = "none";
}

function nearestVehicle(state) {
  const p = state.player?.position || state.camera?.position;
  if (!p) return null;
  let best = null, dist = 4.5;
  for (const v of state.vehicles) {
    const d = v.mesh.position.distanceTo?.(p) ?? 999;
    if (d < dist) { best = v; dist = d; }
  }
  return best;
}

function toggleSeat(state) {
  if (state.activeVehicle) return exitVehicle(state);
  if (!state.nearVehicle) return;
  state.activeVehicle = state.nearVehicle;
  state.activeVehicle.enter("player");
  state.playerWasVisible = state.player?.visible;
  if (state.player) state.player.visible = false;
}

export function exitVehicle(state) {
  const v = state.activeVehicle;
  if (!v) return;
  v.exit("player");
  if (state.player) {
    state.player.visible = state.playerWasVisible !== false;
    state.player.position.copy?.(v.mesh.position);
    state.player.position.x += 1.6;
  }
  state.activeVehicle = null;
}
