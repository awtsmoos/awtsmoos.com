// B'H
import { createWorld } from './state.js';
import { bindInput } from './input.js';
import { createRenderer } from './renderer.js';
import { bindUI } from './ui.js';
import { step, start, restart, nextWorld } from './game.js';
import { createSound } from './sound.js';

const canvas = document.getElementById('game');
const world = createWorld();
world.nextWorld = () => nextWorld(world);

const pollInput = bindInput(world);
const renderer = createRenderer(canvas);
const sound = createSound(world);
const actions = { start: () => start(world), restart };
const updateUI = bindUI(world, actions);
let last = performance.now();

installDebugVessel(world, renderer, actions);

/** B'H
 * The frame reports its own breath; the governor cuts adornment before motion stutters.
 */
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

function installDebugVessel(world, renderer, actions) {
  window.nitzotzDebug = {
    world,
    renderer,
    start() { actions.start(); return this.sample(); },
    sample() {
      const text = document.getElementById('message')?.textContent || '';
      return { camera: { ...world.camera }, player: { ...world.player }, performance: { ...world.performance }, mode: world.mode, perf: world.save.perf, world: world.level?.name, objects: world.level?.objects?.length || 0, message: text, canvases: document.querySelectorAll('canvas').length };
    },
    move(x = 0, y = -1, pulse = 0) {
      world.input.x = x;
      world.input.y = y;
      world.input.pulse = pulse;
      return this.sample();
    }
  };
}

requestAnimationFrame(frame);
