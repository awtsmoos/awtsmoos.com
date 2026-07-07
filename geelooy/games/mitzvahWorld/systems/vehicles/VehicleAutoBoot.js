// B"H
/**
 * @file VehicleAutoBoot.js
 * @description Optional page-side vehicle bootstrap for page-owned Olam scenes.
 */
import * as THREE from "three";
import { installVehicleRuntime } from "./VehicleRuntime.js";

let scheduled = false;

/**
 * B"H
 * Attempts to install the page-side vehicle runtime without touching worker boot.
 *
 * @returns {object|null} Vehicle runtime state or a diagnostic wrapper.
 */
export function bootVehicleRuntime() {
  try {
    globalThis.__MITZVAH_VEHICLES__ ||= { status: "booting", pageRuntimeReady: false };
    return installVehicleRuntime(THREE);
  } catch (error) {
    console.warn("B'H vehicle runtime delayed", error);
    globalThis.__MITZVAH_VEHICLES__ = {
      status: "error",
      pageRuntimeReady: false,
      error: String(error?.message || error)
    };
    return globalThis.__MITZVAH_VEHICLES__;
  }
}

/**
 * B"H
 * Schedules a single optional boot after the main world has become playable.
 */
export function scheduleVehicleRuntimeBoot() {
  if (scheduled) return globalThis.__MITZVAH_VEHICLES__ || null;
  scheduled = true;
  const start = () => setTimeout(bootVehicleRuntime, 250);
  if (globalThis.__AWTSMOOS_BOOT_LOADED__ || globalThis.__AWTSMOOS_LOADING_FINAL_READY__?.playable) start();
  else addEventListener("awtsmoos-game-ready", start, { once: true });
  return globalThis.__MITZVAH_VEHICLES__ || null;
}

scheduleVehicleRuntimeBoot();
