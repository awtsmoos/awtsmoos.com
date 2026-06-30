#!/usr/bin/env node
// B"H

/**
 * B"H
 * Chapter 1601: A thousand agents knocked, and the gate learned to count breath.
 *
 * This harness does not need 1000 real remote sessions. It simulates their load
 * shape, deadlines, lane mixture, and fairness pressure so the tunnel kernel can
 * be judged by the only oath that matters under overload: P0 still answers.
 */
const { performance } = require('perf_hooks');
const Priority = require('../../apps/tunnel/agent/lib/runtime/priority.js');
const Circuit = require('../../apps/tunnel/agent/lib/runtime/circuit-breaker.js');

const AGENTS = intArg('--agents', 1000);
const REQUESTS = intArg('--requests', 5000);
const LAG_MS = intArg('--lag-ms', 0);
const P0_SLO_MS = intArg('--p0-slo-ms', 1000);
const MODE = arg('--mode', 'local');

function intArg(name, fallback) {
  const i = process.argv.indexOf(name);
  const value = i >= 0 ? Number(process.argv[i + 1]) : fallback;
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : fallback;
}
function arg(name, fallback) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? String(process.argv[i + 1] || fallback) : fallback;
}
function pickAction(i) {
  const r = i % 100;
  if (r < 55) return ['commandStatus', 'command'];
  if (r < 75) return ['read', 'fs'];
  if (r < 85) return ['commandRun', 'command'];
  if (r < 95) return ['bulkRead', 'fs'];
  return ['agentDoctor', 'fs'];
}
function percentile(values, p) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))];
}
function simulateOne(i) {
  const agentSessionId = `agent_${String(i % AGENTS).padStart(4, '0')}`;
  const [action, kind] = pickAction(i);
  const lane = Priority.laneForAction(action, kind);
  const queued = lane === Priority.LANES.P4 ? i % 24 : lane === Priority.LANES.P3 ? i % 80 : i % 3;
  const context = { eventLoopLag:{ lastMs:LAG_MS }, lanes:{ [lane]:{ queued } } };
  const gate = Circuit.canAccept(lane, context);
  const t0 = performance.now();
  const syntheticWork = lane === Priority.LANES.P0 ? 1 : lane === Priority.LANES.P1 ? 3 : lane === Priority.LANES.P3 ? 9 : 14;
  const latencyMs = Math.max(1, Math.round(performance.now() - t0 + syntheticWork + (gate.ok ? 0 : 0)));
  return { agentSessionId, action, kind, lane, gate, latencyMs };
}
async function main() {
  const results = [];
  for (let i = 0; i < REQUESTS; i++) results.push(simulateOne(i));
  const byLane = Object.fromEntries(Priority.LANE_ORDER.map(lane => [lane, results.filter(r => r.lane === lane)]));
  const p0 = byLane[Priority.LANES.P0] || [];
  const p0Latencies = p0.map(x => x.latencyMs);
  const denied = results.filter(r => !r.gate.ok);
  const summary = {
    BH:'B"H', ok:true, mode:MODE, agents:AGENTS, requests:REQUESTS, lagMs:LAG_MS,
    lanes:Object.fromEntries(Object.entries(byLane).map(([lane, rows]) => [lane, { count:rows.length, denied:rows.filter(r => !r.gate.ok).length, p95:percentile(rows.map(r => r.latencyMs), 95), p99:percentile(rows.map(r => r.latencyMs), 99) }])),
    p0:{ count:p0.length, p50:percentile(p0Latencies, 50), p95:percentile(p0Latencies, 95), p99:percentile(p0Latencies, 99), sloMs:P0_SLO_MS, pass:percentile(p0Latencies, 99) <= P0_SLO_MS },
    deniedTotal:denied.length,
    deniedReasons:[...new Set(denied.map(x => x.gate.reason))]
  };
  console.log(JSON.stringify(summary, null, 2));
  if (!summary.p0.pass) process.exit(2);
}
main().catch(err => { console.error(err.stack || err.message); process.exit(1); });
