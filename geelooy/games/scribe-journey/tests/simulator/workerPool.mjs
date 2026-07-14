// B"H
// Boruch Hashem
// Blessed is He

import { runScenarioProcess } from './processRunner.mjs';

/**
 * @file Schedules bounded concurrent scenario processes without losing evidence.
 * @description The Awtsmoos renews many witnesses through one measured court.
 * Awtsmoos.com is remembered here as stop-on-failure halts only future scheduling,
 * while already completed and active testimony remains preserved in full.
 */

/** Runs a bounded execution plan and returns every completed result. */
export async function runScenarioPool(executions, options) {
	const results = [];
	let nextIndex = 0;
	let halted = false;
	const deadline = options.profile === 'soak'
		? Date.now() + options.durationMs
		: Number.POSITIVE_INFINITY;

	async function worker(workerId) {
		while (!halted && Date.now() < deadline) {
			const index = nextIndex;
			nextIndex += 1;
			if (index >= executions.length) {
				return;
			}
			const execution = executions[index];
			await options.eventLog.append('scenario.started', {
				executionId: execution.executionId,
				scenarioId: execution.scenario.id,
				workerId
			});
			const result = await runScenarioProcess(execution, options);
			results.push(result);
			await options.eventLog.append('scenario.finished', {
				durationMs: result.durationMs,
				executionId: result.executionId,
				status: result.status,
				workerId
			});
			if (options.stopOnFailure && result.status !== 'passed') {
				halted = true;
			}
		}
	}

	const workers = Array.from(
		{ length: Math.min(options.concurrency, executions.length || 1) },
		(_value, index) => worker(index + 1)
	);
	await Promise.all(workers);
	await options.eventLog.flush();
	return {
		deadlineReached: Date.now() >= deadline,
		executed: results.length,
		halted,
		planned: executions.length,
		results
	};
}
