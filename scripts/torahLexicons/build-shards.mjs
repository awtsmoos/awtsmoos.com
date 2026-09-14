//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module LexiconShardBuilder
 * @description
 * Bounded workers copy independent first-letter ranges from verified native
 * source databases into serving shards. No worker receives corpus payloads or
 * flat-file paths; process lifetime remains the hard memory boundary.
 */

import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const workerFile = fileURLToPath(new URL('./shard-worker.mjs', import.meta.url));

/** Builds every planned serving shard with a small hard worker ceiling. */
export async function buildShards(candidate, plans, requestedConcurrency = 3) {
	const tasks = plans.flatMap(plan => Object.entries(plan.shards).map(([token, expected]) => ({
		sourceId: plan.source.id,
		token,
		expected,
		database: plan.database
	})));
	const concurrency = Math.max(1, Math.min(Number(requestedConcurrency) || 3, 6));
	let cursor = 0;
	let peakWorkerRss = 0;
	async function workerLoop() {
		while (cursor < tasks.length) {
			const result = await runTask(candidate, tasks[cursor++]);
			peakWorkerRss = Math.max(peakWorkerRss, result.peakRss);
		}
	}
	await Promise.all(
		Array.from({ length: Math.min(concurrency, tasks.length) }, workerLoop)
	);
	return { shardCount: tasks.length, peakWorkerRss };
}
/** Runs one bounded native source-to-serving shard worker and parses its tiny report. */
function runTask(candidate, task) {
	return new Promise((resolve, reject) => {
		const args = [
			'--max-old-space-size=64',
			workerFile,
			'--source', task.sourceId,
			'--token', task.token,
			'--database', task.database,
			'--candidate', candidate,
			'--expected', String(task.expected)
		];
		const child = spawn(process.execPath, args, {
			stdio: ['ignore', 'pipe', 'pipe']
		});
		let stdout = '';
		let stderr = '';
		child.stdout.on('data', chunk => {
			stdout = `${stdout}${chunk}`.slice(-4096);
		});
		child.stderr.on('data', chunk => {
			stderr = `${stderr}${chunk}`.slice(-8192);
		});
		child.on('error', reject);
		child.on('exit', code => {
			if (code !== 0) {
				return reject(new Error(
					`shard_worker_failed:${task.sourceId}:${task.token}:${stderr}`
				));
			}
			const match = stdout.match(/peakRss=(\d+)/);
			if (!match) {
				return reject(new Error(
					`shard_worker_missing_report:${task.sourceId}:${task.token}`
				));
			}
			resolve({ peakRss: Number(match[1]) });
		});
	});
}
