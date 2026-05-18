// B"H

import { emit } from "../platform/eventBus.js";
import { loadWorkspaceMemory, remember } from "../platform/workspaceMemory.js";

const runtimes = new Map();
let activeRuntimeId = "";

/**
 * B"H
 * Registers a runtime in the mesh.
 *
 * @param {object} runtime Normalized runtime.
 * @returns {object} Runtime.
 */
export function registerRuntime(runtime) {
  if (!runtime?.id) throw new Error("Runtime requires an id.");
  runtimes.set(runtime.id, runtime);
  return runtime;
}

/**
 * B"H
 * Returns all known runtimes.
 *
 * @returns {object[]} Runtimes.
 */
export function listRuntimes() {
  return [...runtimes.values()];
}

/**
 * B"H
 * Gets one runtime.
 *
 * @param {string} id Runtime id.
 * @returns {object|null} Runtime.
 */
export function getRuntime(id) {
  return runtimes.get(id) || null;
}

/**
 * B"H
 * Gets the active runtime.
 *
 * @returns {object|null} Runtime.
 */
export function getActiveRuntime() {
  return getRuntime(activeRuntimeId) || listRuntimes()[0] || null;
}

/**
 * B"H
 * Sets the active runtime.
 *
 * @param {string} id Runtime id.
 * @returns {object|null} Runtime.
 */
export function setActiveRuntime(id) {
  if (!runtimes.has(id)) return null;
  activeRuntimeId = id;
  remember("activeRuntimeId", id);
  emit("runtime:selected", { runtime: getRuntime(id) });
  return getRuntime(id);
}

/**
 * B"H
 * Restores active runtime from memory when possible.
 *
 * @returns {object|null} Runtime.
 */
export function restoreActiveRuntime() {
  const memory = loadWorkspaceMemory();
  if (memory.activeRuntimeId && runtimes.has(memory.activeRuntimeId)) {
    return setActiveRuntime(memory.activeRuntimeId);
  }
  const first = listRuntimes()[0];
  return first ? setActiveRuntime(first.id) : null;
}

/**
 * B"H
 * Clears the registry for deterministic tests.
 *
 * @returns {void}
 */
export function resetRuntimeRegistry() {
  runtimes.clear();
  activeRuntimeId = "";
}
