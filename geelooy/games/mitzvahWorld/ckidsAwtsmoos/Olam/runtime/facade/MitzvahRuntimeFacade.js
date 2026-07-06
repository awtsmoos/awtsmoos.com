// B"H
/** @file MitzvahRuntimeFacade.js @description Chapter 612: one face for gameplay, Studio, Movie, AI, and tests. */
import { getRuntimeSubsystemRegistry } from "../readiness/RuntimeSubsystemRegistry.js";
import { getRuntimeEntityRegistry } from "./RuntimeEntityRegistry.js";
import { getRuntimeActionRegistry } from "./RuntimeActionRegistry.js";
const GLOBAL_KEY = "__MITZVAH_WORLD_FACADE__";
export function createMitzvahRuntimeFacade({ olam = null, scene = null } = {}) {
  const readiness = getRuntimeSubsystemRegistry(), entities = getRuntimeEntityRegistry(), actions = getRuntimeActionRegistry();
  return {
    olam, scene, readiness, entities, actions,
    registerEntity: entity => entities.upsert(entity),
    registerAction: action => actions.register(action),
    runAction: (id, context = {}) => actions.run(id, { olam, scene, ...context }),
    markReady: (id, data = {}) => readiness.complete(id, data),
    markLoading: (id, progress = 1, data = {}) => readiness.update(id, { progress, status:"loading", data }),
    snapshot: () => ({ readiness:readiness.snapshot(), entities:entities.snapshot(), actions:actions.snapshot() })
  };
}
export function getMitzvahRuntimeFacade(seed = {}) { globalThis[GLOBAL_KEY] ||= createMitzvahRuntimeFacade(seed); return globalThis[GLOBAL_KEY]; }
export default getMitzvahRuntimeFacade;
