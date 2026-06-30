// B"H
import { createLevel, WORLDS } from '../level.js';
import { saveGame } from '../save.js';
import { SEFIROT, createCamera, createDanger, createPlayer } from '../state.js';

/** Open the run gate from the overlay into live play. */
export function start(world) {
  if (world.mode === 'playing') return;
  world.mode = 'playing';
  world.lost = false;
  world.message = 'GO. Eat small vessels, pulse through lanes, dodge giants.';
  world.events.push(['start']);
}

/** Hard reset: the cleanest retry after concealment. */
export function restart() {
  location.reload();
}

/** Carry completion into the next world and reset the player vessel. */
export function nextWorld(world) {
  world.save.completed = [...new Set([...world.save.completed, world.level.name])];
  saveGame(world.save);
  const level = createLevel(world.save, world.level.worldIndex + 1);
  Object.assign(world, resetRun(level), { mode: 'playing', save: world.save, message: `Entered ${level.name}. The ascent gets sharper.` });
  world.events.push(['start']);
}

/** Upgrade the sefirah ladder as sparks cross thresholds. */
export function upgrades(world) {
  const next = Math.min(SEFIROT.length - 1, Math.floor(world.score / 1250));
  if (next > world.sefirah) {
    world.sefirah = next;
    world.message = `Sefirah: ${SEFIROT[next][0]} — ${SEFIROT[next][1]}`;
    world.events.push(['upgrade']);
  }
}

/** Win only when the target is truly met. */
export function win(world) {
  if (world.won) return;
  world.won = true;
  world.mode = 'won';
  world.save.best = Math.max(world.save.best, world.score);
  world.save.completed = [...new Set([...world.save.completed, world.level.name])];
  saveGame(world.save);
  world.message = `${world.level.name} revealed. Next: ${WORLDS[(world.level.worldIndex + 1) % WORLDS.length][0]}.`;
  world.events.push(['win']);
}

/** Loss is explicit and navigable, not a mysterious frozen ascent. */
export function lose(world) {
  if (world.lost) return;
  world.lost = true;
  world.mode = 'lost';
  world.save.best = Math.max(world.save.best, world.score);
  saveGame(world.save);
  world.message = `Concealment returned. Best saved: ${world.save.best}. Hit RETRY.`;
  world.events.push(['lose']);
}

function resetRun(level) {
  return { level, player: createPlayer(), camera: createCamera(), danger: createDanger(), input: { x: 0, y: 0, pulse: 0 }, particles: [], absorbers: [], floaters: [], score: 0, timeLeft: level.time, won: false, lost: false, sefirah: 0 };
}
