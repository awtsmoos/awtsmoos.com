import { createGameState } from '../../../core/state.js';
import { stepState } from '../../../core/loop.js';
import { createReport } from './sim/ReportFactory.js';
import { finishReport } from './sim/ReportFinish.js';
import { observeFrame } from './sim/FrameObserver.js';
import { sampleFrame } from './sim/FrameSample.js';
import { applyScenario } from './sim/ScenarioSetup.js';
import { neutralInput } from './sim/NeutralInput.js';
export { assertHealthyReport } from './sim/ReportHealth.js';

/** B"H — slim simulator gateway; the measuring angels live in split files. */
export function simulateMatch(map, options = {}) {
  const started = Date.now();
  const frames = options.frames ?? 1800;
  const botCount = options.botCount ?? 5;
  const sampleEvery = options.sampleEvery ?? 60;
  const state = createGameState(map, botCount, options.character || {}, options.cosmetic || {});
  state.phase = 'playing';
  state.fastSim = !!options.fast;
  applyScenario(state, options.scenario);
  const input = options.input || neutralInput();
  const report = createReport(map, frames, botCount, options, state);
  for (let i = 0; i < frames; i++) {
    stepState(state, input);
    observeFrame(report, state);
    if (!options.fast && sampleEvery > 0 && i % sampleEvery === 0) sampleFrame(report, state);
    if (state.winner && options.stopOnWinner !== false) break;
  }
  finishReport(report, state, Date.now() - started);
  return report;
}

export function simulateMapSet(maps, options = {}) {
  return maps.map(map => simulateMatch(map, options));
}
