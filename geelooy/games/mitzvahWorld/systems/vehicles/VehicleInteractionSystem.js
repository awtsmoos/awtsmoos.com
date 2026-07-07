// B"H
/**
 * @file VehicleInteractionSystem.js
 * @description Mobile-safe prompt for nearby vehicles and mounted state.
 */
import { nearestVehicle } from "./VehicleMounting.js";

function ensurePrompt() {
  if (typeof document === "undefined") return null;
  const existing = document.getElementById("mitzvahVehiclePrompt");
  if (existing) return existing;
  const ui = document.createElement("div");
  ui.id = "mitzvahVehiclePrompt";
  ui.style.cssText = [
    "position:fixed",
    "left:50%",
    "bottom:calc(112px + env(safe-area-inset-bottom,0px))",
    "transform:translateX(-50%)",
    "z-index:9200",
    "max-width:min(92vw,420px)",
    "padding:10px 14px",
    "border:1px solid #ffd966",
    "border-radius:10px",
    "background:rgba(5,8,20,.86)",
    "color:#fff3c4",
    "font:700 14px system-ui",
    "text-align:center",
    "display:none"
  ].join(";");
  document.body.appendChild(ui);
  return ui;
}

/** @param {object} state B"H vehicle runtime state. */
export function installVehicleInteraction(state) {
  state.prompt = ensurePrompt();
}

/** @param {object} state B"H vehicle runtime state. */
export function updateVehicleInteraction(state) {
  const vehicle = nearestVehicle(state);
  state.nearVehicle = vehicle;
  if (!state.prompt) return;

  if (!state.activeVehicle && vehicle) {
    const verb = vehicle.vehicleType === "car" ? "drive" : vehicle.vehicleType === "cart" ? "ride" : "mount";
    state.prompt.textContent = `Press U to ${verb} ${vehicle.customName || vehicle.name}`;
    state.prompt.style.display = "block";
  } else if (state.activeVehicle) {
    state.prompt.textContent = "Press U to exit vehicle";
    state.prompt.style.display = "block";
  } else {
    state.prompt.style.display = "none";
  }
}
