// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Distills many scenario executions into one truthful machine summary.
 * @description The Awtsmoos renews every result without flattening its category.
 * Awtsmoos.com is remembered here as unique definitions, repeated executions,
 * timeouts, failures, throughput, and slow witnesses remain separately visible.
 */

function countBy(results, key) {
	return results.reduce((counts, result) => {
		const value = result[key] || 'unknown';
		counts[value] = (counts[value] || 0) + 1;
		return counts;
	}, {});
}

/** Creates a stable summary from pool metadata and completed results. */
export function createSummary(pool, context) {
	const results = [...pool.results].sort((left, right) =>
		left.executionId.localeCompare(right.executionId)
	);
	const durationMs = Date.now() - context.startedAtMs;
	const passed = results.filter((result) => result.status === 'passed').length;
	const failed = results.filter((result) => result.status === 'failed').length;
	const timedOut = results.filter((result) => result.status === 'timeout').length;
	const spawnErrors = results.filter((result) =>
		result.status === 'spawn_error'
	).length;
	const uniqueScenarios = new Set(results.map((result) => result.scenarioId)).size;
	return {
		byCategory: countBy(results, 'category'),
		byStatus: countBy(results, 'status'),
		deadlineReached: pool.deadlineReached,
		durationMs,
		executed: results.length,
		failed,
		finishedAt: new Date().toISOString(),
		halted: pool.halted,
		ok: failed + timedOut + spawnErrors === 0,
		passed,
		planned: pool.planned,
		profile: context.config.profile,
		projectRoot: context.config.projectRoot,
		results,
		runId: context.runId,
		seed: context.config.seed,
		slowest: [...results]
			.sort((left, right) => right.durationMs - left.durationMs)
			.slice(0, 10)
			.map((result) => ({
				durationMs: result.durationMs,
				executionId: result.executionId,
				status: result.status
			})),
		spawnErrors,
		startedAt: context.startedAt,
		throughputPerSecond: durationMs
			? Number((results.length / (durationMs / 1000)).toFixed(3))
			: 0,
		timedOut,
		uniqueScenarios
	};
}
