// B"H
import { step, start, restart, nextWorld } from './game.js';
import { bindInput } from './input.js';
import { createRenderer } from './renderer.js';
import { createSound } from './sound.js';
import { createWorld } from './state.js';
import { bindUI } from './ui.js';

const canvas = document.getElementById('game');
const world = createWorld();
const renderer = createRenderer(canvas);
const sound = createSound(world);
const actions = createActions(world);
const pollInput = bindInput(world, actions);
const updateUI = bindUI(world, actions);
let last = performance.now();

world.nextWorld = actions.nextWorld;
installDebugVessel(world, renderer, actions);
requestAnimationFrame(frame);

/** The frame loop is the pulse of the whole little universe. */
function frame(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  world.lastDt = dt;
  world.performance.frame += 1;
  pollInput();
  step(world, dt);
  renderer.render(world);
  updateUI();
  while (world.events.length) sound.event(world.events.shift());
  requestAnimationFrame(frame);
}

/** UI and keyboard share one simple navigation map. */
function createActions(world) {
  return {
    primary() { if (world.mode === 'won') return nextWorld(world); if (world.mode === 'lost') return restart(); return start(world); },
    start: () => start(world),
    restart,
    nextWorld: () => nextWorld(world)
  };
}

/** Debug vessel for runtime inspection from the browser console. */
function installDebugVessel(world, renderer, actions) {
  window.nitzotzDebug = {
    world, renderer, actions,
    start() { actions.start(); return this.sample(); },
    move(x = 0, y = -1, pulse = 0) { world.input.x = x; world.input.y = y; world.input.pulse = pulse; return this.sample(); },
    sample() {
      return { mode: world.mode, world: world.level.name, score: world.score, target: world.level.target, camera: { ...world.camera }, player: { ...world.player }, danger: { ...world.danger }, objects: world.level.objects.length, message: world.message };
    }
  };
}
