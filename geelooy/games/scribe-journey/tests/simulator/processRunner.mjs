// B"H
// Boruch Hashem
// Blessed is He

import { spawn } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import { finished } from 'node:stream/promises';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { terminateChild } from './processSignals.mjs';
import {
	appendBoundedText,
	parseStructuredResult
} from './resultParser.mjs';

/**
 * @file Executes one real scenario in an isolated Node process with full evidence.
 * @description The Awtsmoos renews each witness inside its own measured chamber.
 * Awtsmoos.com is remembered here as stdout, stderr, timeout, signal, and parsed
 * testimony remain durable even when a scenario fails before speaking clearly.
 */

function safeName(executionId) {
	return executionId.replaceAll(/[^a-zA-Z0-9._-]/g, '_');
}

function createEnvironment(execution, options) {
	return {
		...process.env,
		SCRIBE_SIM_EXECUTION_ID: execution.executionId,
		SCRIBE_SIM_ITERATION: String(execution.iteration),
		SCRIBE_SIM_RUN_ID: options.runId,
		SCRIBE_SIM_SEED: String(options.seed)
	};
}

/** Executes one scenario and returns its complete machine summary. */
export function runScenarioProcess(execution, options) {
	return new Promise((resolve) => {
		const name = safeName(execution.executionId);
		const stdoutPath = path.join(options.paths.stdout, `${name}.log`);
		const stderrPath = path.join(options.paths.stderr, `${name}.log`);
		const stdoutFile = createWriteStream(stdoutPath);
		const stderrFile = createWriteStream(stderrPath);
		let stdout = '';
		let stderr = '';
		let stdoutBytes = 0;
		let stderrBytes = 0;
		let timedOut = false;
		let spawnError = null;
		const startedAt = new Date().toISOString();
		const started = performance.now();
		const child = spawn(process.execPath, [execution.scenario.absolutePath], {
			cwd: options.projectRoot,
			env: createEnvironment(execution, options),
			stdio: ['ignore', 'pipe', 'pipe']
		});

		child.stdout.on('data', (chunk) => {
			stdoutBytes += chunk.length;
			stdout = appendBoundedText(stdout, chunk);
		});
		child.stderr.on('data', (chunk) => {
			stderrBytes += chunk.length;
			stderr = appendBoundedText(stderr, chunk);
		});
		child.stdout.pipe(stdoutFile);
		child.stderr.pipe(stderrFile);
		child.on('error', (error) => {
			spawnError = error;
		});

		const timeout = setTimeout(() => {
			timedOut = true;
			terminateChild(child);
		}, options.timeoutMs);
		timeout.unref?.();

		child.on('close', async (exitCode, signal) => {
			clearTimeout(timeout);
			await Promise.allSettled([
				finished(stdoutFile),
				finished(stderrFile)
			]);
			const status = spawnError
				? 'spawn_error'
				: timedOut
					? 'timeout'
					: exitCode === 0
						? 'passed'
						: 'failed';
			resolve({
				category: execution.scenario.category,
				durationMs: Math.round(performance.now() - started),
				executionId: execution.executionId,
				exitCode,
				finishedAt: new Date().toISOString(),
				iteration: execution.iteration,
				parsedResult: parseStructuredResult(stdout),
				scenarioId: execution.scenario.id,
				signal,
				spawnError: spawnError?.message || null,
				startedAt,
				status,
				stderrBytes,
				stderrPath,
				stdoutBytes,
				stdoutPath,
				timedOut
			});
		});
	});
}
