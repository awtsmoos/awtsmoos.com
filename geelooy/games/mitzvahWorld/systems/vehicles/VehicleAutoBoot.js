// B"H
/** AutoBoot: when the main world awakens, the roads awaken after it. */
import * as THREE from "three";
import { installVehicleRuntime } from "./VehicleRuntime.js";

function boot() {
  try {
    globalThis.__MITZVAH_VEHICLES__ ||= { status: "booting" };
    installVehicleRuntime(THREE);
  } catch (error) {
    console.warn("B'H vehicle runtime delayed", error);
    globalThis.__MITZVAH_VEHICLES__ = { status: "error", error };
  }
}

if (document.readyState === "loading") addEventListener("DOMContentLoaded", boot, { once: true });
else setTimeout(boot, 500);
