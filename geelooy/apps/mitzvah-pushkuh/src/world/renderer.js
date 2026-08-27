// B"H
// Engine renderer: commands, ECS, spatial grid, replay, backend-selected revelation.
import { colorFor } from "./palette.js";
import { benchmark, createDevicePolicy } from "./core/device-policy.js";
import { buildAtlas } from "./assets/atlas-builder.js";
import { createBackend } from "./render/backend-select.js";
import { createCamera } from "./render/camera.js";
import { createCommandBuffer } from "./render/commands.js";
import { createCreatureSystem } from "./sim/creature-sim.js";
import { createECS } from "./ecs/ecs-world.js";
import { createEffects } from "./effects.js";
import { createFrameBudget, tieredQuality } from "./core/frame-budget.js";
import { createLayers } from "./layers.js";
import { createLightBuffer } from "./light-buffer.js";
import { buildWorldGraph } from "./render/passes/world-graph.js";
import { createRenderQueue, visible } from "./render-queue.js";
import { createReplay } from "./persistence/replay.js";
import { createSkySystem } from "./sim/sky-sim.js";
import { createStats } from "./core/stats.js";
import { createUniformGrid } from "./spatial/uniform-grid.js";
import { createVegetationSystem } from "./sim/vegetation-sim.js";
import { createWaterSystem } from "./sim/water-sim.js";
import { createWeatherSystem } from "./sim/weather-sim.js";
import { createWorldDirector } from "./sim/director.js";
import { createWorldState } from "./sim/world-state.js";
import { createWindField } from "./sim/wind-field.js";
import { snapshot } from "./persistence/save-state.js";
import { stepClock } from "./core/clock.js";
import { drawDebug } from "./debug-overlay.js";
import { drawScene } from "./scene.js";
import { bodies, body, drawConstellations, drawReflections, enqueueSpark, moveBodies } from "./entities.js";
import { qualityFor } from "./core/quality.js";

export function createRenderer(canvas, opts = {}) {
  const backend = createBackend(canvas, opts.preferBackend || "canvas", opts), commands = createCommandBuffer();
  let ctx = backend.ctx, cssW = 1, cssH = 1, w = 1, h = 1, t = 0, last = 0, layers = null, tools = {}, graph = null, paused = false, debug = opts.debug;
  let baseQ = qualityFor(1, 1, opts.reduced), q = baseQ, entries = [], sparks = [], pointer = null, lastStats = null, lastSnapshot = null;
  const policy = opts.policy || createDevicePolicy(); policy.init?.(); const budget = createFrameBudget(policy), stats = createStats(), camera = createCamera(), queue = createRenderQueue();
  const sky = createSkySystem(), weather = createWeatherSystem(), water = createWaterSystem(), vegetation = createVegetationSystem(), creatures = createCreatureSystem(), director = createWorldDirector(), wind = createWindField(), world = createWorldState();
  const ecs = createECS(1024), grid = createUniformGrid(128), replay = createReplay(); let effects = createEffects(q); benchmark();
  function resize(width, height, dpr) { cssW = Math.max(1, width); cssH = Math.max(1, height); baseQ = qualityFor(cssW, cssH, opts.reduced); baseQ.dpr = Math.min(baseQ.dpr, dpr || baseQ.dpr); rebuild(); }
  function rebuild() { q = tieredQuality(baseQ, budget.tier()); w = Math.floor(cssW * q.dpr); h = Math.floor(cssH * q.dpr); backend.resize(w, h); ctx = backend.ctx || canvas.getContext("2d", { alpha: false }); layers = createLayers(w, h, q); tools = { atlas: buildAtlas(), light: createLightBuffer(w, h), sky, weather, water, vegetation, creatures, weatherState: {} }; backend.prepareAtlas?.(tools.atlas); effects = createEffects(q); graph = buildWorldGraph({ tools, camera, scene: drawScene, world: drawWorld }); setEntries(entries); }
  function setEntries(next = []) { entries = next || []; world.setEntries(entries); sparks = bodies(entries, w, h, q); seedECS(); }
  function seedECS() { sparks.forEach(s => ecs.spawn({ x: s.x, y: s.y, r: s.r, color: s.c, entry: s.entry })); }
  function plant(entry) { const s = body(entry, w, h, true); sparks.push(s); sparks = sparks.slice(-q.maxBodies); replay.record("plant", { id: entry.id }); camera.strike(); water.disturb(w / 2, h * .72, 1.6); world.pushInteraction("plant", w / 2, h * .72, 1.6); effects.shock(w / 2, h * .34, colorFor(entry), q.emergency ? .6 : 1.4); }
  function bless(point, power = 1) { pointer = scalePoint(point); replay.record("bless", { x: pointer.x, y: pointer.y, power }); camera.bless(pointer, w, h); water.disturb(pointer.x, pointer.y, .7 * power); world.pushInteraction("bless", pointer.x, pointer.y, power); if (!q.emergency) { effects.trace(pointer); effects.burst(pointer.x, pointer.y, "#8feaff", .22 * power); } }
  function strike(point) { bless(point, 1); replay.record("strike", pointer || {}); camera.strike(); world.pushInteraction("strike", pointer.x, pointer.y, 2); if (!q.emergency && pointer) effects.shock(pointer.x, pointer.y, "#ffe08a", 1); }
  function frame(now = performance.now()) {
    if (paused || !ctx) return; const c = stepClock(last, now); last = c.now; adapt(c.delta, now); t += .016 * c.dt; updateSystems(c.dt);
    stats.resetPasses(); backend.begin?.(); graph?.run(ctx, { w, h, t, q, layers, stats }); drawDebug(ctx, { ...lastStats, enabled: debug }); backend.end?.(); if (policy.shouldCompact?.(now)) compact();
  }
  function updateSystems(dt) { camera.update(dt); water.update(dt); world.update(dt); const ds = director.update(t, entries); weather.set(ds.weather); wind.update(t, ds.weather); tools.weatherState = weather.update(t); tools.weatherState.wind = wind.strength(); }
  function drawWorld(ctx) {
    const rows = visible(sparks, w, h); grid.clear(); commands.clear(); moveBodies(rows, pointer, t, 1); effects.move(1); rows.forEach(s => grid.add(s, s.x, s.y));
    drawConstellations(ctx, rows, q); rows.forEach(s => queue.add("spark", s.y, s)); queue.flush(cmd => enqueueSpark(commands, cmd.item, t, q, tools)); backend.execute?.(commands); stats.setCommands(commands.count()); drawReflections(ctx, rows, h, q); effects.draw(ctx, tools);
  }
  function adapt(delta, now) { const action = budget.sample(delta); lastStats = stats.frame(delta, q, budget.tier()); if (action !== "hold") rebuild(); if (stats.shouldReport(now)) report(lastStats); }
  function report(data) { lastSnapshot = snapshot(entries, { replay: replay.dump(), event: director.eventName?.() }); if (typeof window === "undefined" && typeof self?.postMessage === "function") self.postMessage({ type: "stats", stats: { ...data, event: director.eventName?.(), backend: backend.kind, cells: grid.size(), gpu: backend.stats } }); }
  function compact() { tools = { ...tools, light: createLightBuffer(w, h) }; effects = createEffects(q); }
  function scalePoint(point) { return { x: point.x * q.dpr, y: point.y * q.dpr }; }
  function setPaused(value) { paused = value; }
  function setDebug(value) { debug = value; }
  return { resize, setEntries, plant, bless, strike, frame, setPaused, setDebug, snapshot: () => lastSnapshot };
}
