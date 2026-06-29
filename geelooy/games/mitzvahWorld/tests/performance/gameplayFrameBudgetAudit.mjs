// B"H
/** Headless gameplay CPU budget audit for budgeted frame pulses. Not real browser FPS proof. */
import { performance } from 'node:perf_hooks';
import { resetLivingWorldState } from '../../ckidsAwtsmoos/systems/livingWorld/LivingWorldState.js';
import { createLivingWorldRuntime } from '../../ckidsAwtsmoos/systems/livingWorld/LivingWorldRuntime.js';
import { simulateStarterGameplay } from '../../ckidsAwtsmoos/systems/tutorial/StarterGameplaySimulationRuntime.js';
function assert(ok, msg) { if (!ok) throw new Error(msg); }
const memory = new Map();
globalThis.localStorage = { getItem:k => memory.get(k) || null, setItem:(k,v) => memory.set(k,String(v)), removeItem:k => memory.delete(k) };
globalThis.CustomEvent ||= class CustomEvent { constructor(type, init={}) { this.type = type; this.detail = init.detail; } };
globalThis.dispatchEvent ||= () => true;
function timed(name, fn) { const t0 = performance.now(); const value = fn(); const ms = performance.now() - t0; return { name, ms, value }; }
resetLivingWorldState({});
const runtime = createLivingWorldRuntime(globalThis, { skipWorldStateHydration:true });
const samples = [];
for (let i = 0; i < 60; i++) samples.push(timed('livingWorld.frame', () => runtime.frame(`budget-${i}`, 6 + (i % 18))));
resetLivingWorldState({});
globalThis.__MITZVAH_STARTER_SIGNAL_BRIDGE__?.dispose?.();
delete globalThis.__MITZVAH_STARTER_SIGNAL_BRIDGE__;
delete globalThis.__MITZVAH_STARTER_EXPERIENCE__;
const starterT0 = performance.now();
await simulateStarterGameplay({ reset:false, flushPersistence:false });
const starterMs = performance.now() - starterT0;
const ms = samples.map(s => s.ms).sort((a,b) => a-b);
const avg = ms.reduce((a,b)=>a+b,0) / ms.length;
const p95 = ms[Math.floor(ms.length * 0.95)];
const max = ms.at(-1);
const budget = { avgMs:2.5, p95Ms:8, maxMs:16.67, starterMs:50 };
const result = { ok:avg <= budget.avgMs && p95 <= budget.p95Ms && max <= budget.maxMs && starterMs <= budget.starterMs, simulatedLayer:'node-cpu-headless-budgeted-frame-not-browser-fps-proof', frames:60, avg:Number(avg.toFixed(3)), p95:Number(p95.toFixed(3)), max:Number(max.toFixed(3)), starterMs:Number(starterMs.toFixed(3)), dirty:runtime.state.dirty, skippedSaves:runtime.state.skippedSaves, budget };
console.log(JSON.stringify(result, null, 2));
assert(result.ok, 'headless gameplay frame budget exceeded');
