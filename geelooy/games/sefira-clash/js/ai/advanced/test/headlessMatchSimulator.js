//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the headless match simulator vessel in this instant, revealing
 * its focused js ai advanced test service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
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

/**
 * Reveals the simulate map set behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} maps The maps value entering this behavior.
 * @param {*} options The options value entering this behavior.
 */
export function simulateMapSet(maps, options = {}) {
	return maps.map(map => simulateMatch(map, options));
}
