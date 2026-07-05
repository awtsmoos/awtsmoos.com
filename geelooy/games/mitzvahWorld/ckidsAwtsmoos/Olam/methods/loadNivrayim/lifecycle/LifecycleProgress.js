// B"H
/** LifecycleProgress.js — tiny worker progress sparks for each awakening phase. */
import { postWorkerProgress } from "../../../oyved/core/protocol/WorkerProtocol.js";
export function labelOf(nivra, i, total) { return `${i}/${total}:${nivra?.name || nivra?.constructor?.name || "Unknown"}:${nivra?.type || nivra?.constructor?.name || "no-type"}`; }
export function mark(stage, data = {}) { const label = data.label ? `:${String(data.label).slice(0, 90)}` : ""; postWorkerProgress(`lifecycle:${stage}${label}`, data); }
export function loadingPercent(index, total) { return 50 + (((index + 1) / Math.max(1, total)) * 50); }
