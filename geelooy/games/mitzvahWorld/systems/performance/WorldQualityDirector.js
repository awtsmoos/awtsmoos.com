// B"H
/**
 * @file WorldQualityDirector.js
 * Runtime governor for the living ancient world: it samples frame breath, blends
 * scene metrics, and publishes one budget every system can obey.
 */
import { collectWorldRuntimeMetrics } from './WorldRuntimeMetrics.js';
import { classifyPerformanceBudget, mergeRuntimeBudget } from './WorldPerformanceBudget.js';

function avg(xs) { return xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length); }
function percentile(xs, p) { const s = [...xs].sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.floor(s.length * p))] || 0; }
export function createWorldQualityDirector(scope = globalThis, options = {}) {
  const frameMs = [];
  const maxFrames = options.maxFrames || 180;
  const state = { running:false, budget:null, metrics:null, samples:0, lastPublish:0 };
  function publish(extra = {}) {
    const metrics = collectWorldRuntimeMetrics(scope);
    const mean = avg(frameMs);
    const fps = 1000 / Math.max(0.001, mean || 16.67);
    const input = {
      fps,
      p95FrameMs: percentile(frameMs, .95),
      p99FrameMs: percentile(frameMs, .99),
      drawCalls: metrics.renderer?.render?.calls || 0,
      triangles: metrics.scene.triangles,
      visibleMeshes: metrics.scene.visibleMeshes,
      memory: metrics.memory,
      ...extra
    };
    const budget = mergeRuntimeBudget(state.budget, classifyPerformanceBudget(input));
    state.budget = budget;
    state.metrics = metrics;
    state.samples += 1;
    state.lastPublish = Date.now();
    scope.__MITZVAH_WORLD_RUNTIME_METRICS__ = metrics;
    scope.__MITZVAH_WORLD_PERFORMANCE_BUDGET__ = budget;
    scope.dispatchEvent?.(new CustomEvent('mitzvah-world:performance-budget', { detail:{ budget, metrics } }));
    return { budget, metrics };
  }
  function frame(now) {
    if (!state.running) return;
    const previous = state._last || now;
    state._last = now;
    frameMs.push(now - previous);
    while (frameMs.length > maxFrames) frameMs.shift();
    if (!state.lastPublish || now - state._lastNowPublish > (options.publishEveryMs || 1000)) {
      state._lastNowPublish = now;
      publish();
    }
    scope.requestAnimationFrame?.(frame);
  }
  function start() {
    if (state.running) return state;
    state.running = true;
    scope.requestAnimationFrame?.(frame);
    return state;
  }
  function stop() { state.running = false; return state; }
  return { state, start, stop, publish, frameMs };
}
export default createWorldQualityDirector;
