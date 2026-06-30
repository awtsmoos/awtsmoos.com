// B"H
import { createLevel, WORLDS } from '../level.js';
import { createPerformanceState } from '../performance.js';
import { loadSave } from '../save.js';
import { OPENING } from './constants.js';
import { createCamera, createDanger, createPlayer } from './factories.js';

/** Create the whole world state from persistence, no guessed globals required. */
export function createWorld() {
  const save = loadSave();
  const level = createLevel(save, save.completed.length % WORLDS.length);
  return {
    mode: 'ready', save, level,
    performance: createPerformanceState(),
    player: createPlayer(), camera: createCamera(), danger: createDanger(),
    input: { x: 0, y: 0, pulse: 0 }, particles: [], absorbers: [], floaters: [], events: [],
    score: 0, timeLeft: level.time, won: false, lost: false, sefirah: 0,
    message: `${OPENING} Best ${save.best}.`
  };
}
