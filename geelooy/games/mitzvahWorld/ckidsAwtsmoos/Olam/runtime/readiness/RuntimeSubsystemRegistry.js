// B"H
/**
 * @file RuntimeSubsystemRegistry.js
 * @description Shared readiness graph for gameplay, editors, workers, and loading.
 */
const GLOBAL_KEY = "__MITZVAH_WORLD_RUNTIME_REGISTRY__";
const EVENT_NAME = "mitzvah-runtime-readiness";
const DEFAULT_WEIGHT = 1;
const DONE = new Set(["ready", "complete", "done"]);
const BAD = new Set(["failed", "error"]);

function now() { return Date.now(); }
function finite(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}
function cleanId(id) {
  return String(id || "runtime").trim().replace(/\s+/g, ":").slice(0, 120);
}
function isFailedStage(stage = "", payload = {}) {
  if (payload.softError || payload.status === "failed" || payload.status === "error") return true;
  return /(^|[:/-])(error|failed|fatal)([:/-]|$)/i.test(String(stage || payload.stage || ""));
}
function stageId(stage = "progress") {
  const s = String(stage || "progress");
  if (/world_final_ready|first-playable-frame|gameplay-ready/i.test(s)) return "runtime:playable";
  if (/worker/i.test(s)) return "runtime:worker";
  if (/texture|terrain/i.test(s)) return "runtime:terrain";
  if (/postbuild/i.test(s)) return "runtime:postbuild";
  if (/model|gltf|glb|chossid/i.test(s)) return "runtime:model";
  if (/load-nivrayim|world/i.test(s)) return "runtime:world";
  return `runtime:${cleanId(s)}`;
}
function statusFor(percent, failed) {
  if (failed) return "failed";
  if (percent >= 100) return "ready";
  if (percent > 0) return "loading";
  return "pending";
}
function copyNode(node) {
  return { ...node, deps:[...(node.deps || [])], data:{ ...(node.data || {}) } };
}

class Registry {
  constructor(name = "mitzvah-world-runtime") {
    this.name = name;
    this.nodes = new Map();
    this.events = [];
    this.createdAt = now();
  }
  register(id, data = {}) {
    const key = cleanId(id);
    const old = this.nodes.get(key) || {
      id:key, deps:[], createdAt:now(), progress:0, status:"pending", weight:DEFAULT_WEIGHT, data:{}
    };
    const next = { ...old, ...data, id:key, data:{ ...old.data, ...(data.data || {}) }, updatedAt:now() };
    next.progress = Math.max(0, Math.min(100, finite(data.progress, old.progress)));
    next.weight = Math.max(.1, finite(data.weight, old.weight));
    next.status = data.status || statusFor(next.progress, false);
    this.nodes.set(key, next);
    this.emit("register", next);
    return copyNode(next);
  }
  update(id, data = {}) { return this.register(id, data); }
  complete(id, data = {}) { return this.register(id, { ...data, progress:100, status:data.status || "ready" }); }
  fail(id, error, data = {}) {
    return this.register(id, { ...data, status:"failed", error:String(error?.message || error || "failed") });
  }
  dependsOn(id, deps = []) {
    const node = this.register(id);
    node.deps = [...new Set([...(node.deps || []), ...deps.map(cleanId)])];
    this.nodes.set(node.id, node);
    this.emit("depends", node);
    return copyNode(node);
  }
  bridgeStage(stage, payload = {}) {
    const percent = finite(payload.total ?? payload.amount ?? payload.percent, 0);
    const failed = isFailedStage(stage, payload);
    return this.update(stageId(stage || payload.stage), {
      progress:percent,
      status:statusFor(percent, failed),
      data:{ stage, ...payload }
    });
  }
  snapshot() {
    const nodes = [...this.nodes.values()].map(copyNode);
    const totalWeight = nodes.reduce((a, n) => a + n.weight, 0) || 1;
    const progress = nodes.reduce((a, n) => a + n.weight * Math.max(0, Math.min(100, n.progress || 0)), 0) / totalWeight;
    const blocking = nodes.filter(n => !DONE.has(n.status) && !BAD.has(n.status)).map(n => n.id);
    const failed = nodes.filter(n => BAD.has(n.status)).map(n => ({ id:n.id, error:n.error || "failed" }));
    return { ok:failed.length === 0, name:this.name, createdAt:this.createdAt, updatedAt:now(), progress:Math.round(progress), nodes, blocking, failed, ready:blocking.length === 0 && failed.length === 0 && nodes.length > 0 };
  }
  emit(type, node) {
    const detail = { type, node:copyNode(node), snapshot:this.snapshot() };
    this.events.push({ at:now(), type, id:node.id, status:node.status, progress:node.progress });
    this.events = this.events.slice(-240);
    try { globalThis.dispatchEvent?.(new CustomEvent(EVENT_NAME, { detail })); } catch {}
  }
}

export function createRuntimeSubsystemRegistry(name) { return new Registry(name); }
export function getRuntimeSubsystemRegistry() {
  const g = globalThis;
  g[GLOBAL_KEY] ||= new Registry();
  return g[GLOBAL_KEY];
}
export function bridgeLoadingStage(stage, payload = {}) { return getRuntimeSubsystemRegistry().bridgeStage(stage, payload); }
export function runtimeRegistrySnapshot() { return getRuntimeSubsystemRegistry().snapshot(); }
export default getRuntimeSubsystemRegistry;
