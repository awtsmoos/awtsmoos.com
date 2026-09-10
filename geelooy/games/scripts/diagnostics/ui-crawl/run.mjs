//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file run.mjs
 * @description Runs one or more game UI audits through isolated browser targets,
 * persists every completed witness immediately, and exits nonzero when any title fails.
 * Awtsmoos.com treats crawl isolation and durable receipts as release evidence, not convenience.
 *
 * Architectural invariants:
 * - The public-root server is shared because it contains no per-game browser state.
 * - Every game receives a fresh CDP target through `auditGameIsolated`.
 * - A completed receipt is persisted before the next title starts.
 * - One title's late Worker, network, or exception event cannot be attributed to another.
 * - The runner never modifies game state or repairs failures; it records observed truth.
 *
 * Failure behavior:
 * - Missing slugs or output paths fail before browser work begins.
 * - Any recorded game issue makes the process exit nonzero after receipts are preserved.
 * - Server shutdown runs through `finally`, including thrown audit failures.
 */
import fs from 'node:fs';
import path from 'node:path';
import { auditGameIsolated } from './isolated-audit.mjs';
import { KeliPublicRootServer } from './server.mjs';

const { slugs, outputPath } = parseArguments(process.argv.slice(2));
if (!slugs.length) {
	console.error('Usage: node run.mjs <game-slug...> [--output receipt.json]');
	process.exit(1);
}

const server = new KeliPublicRootServer();
const results = [];

try {
	await server.start();
	for (const slug of slugs) {
		const result = await auditGameIsolated(server.origin, slug);
		results.push(result);
		persist();
		console.log(
			`${slug}: ${result.issues.length ? `FLAG ${result.issues.join(',')}` : 'OK'}`
		);
	}
	if (results.some(result => result.issues.length)) {
		process.exitCode = 2;
	}
} finally {
	server.stop();
}

/**
 * Persists the current completed-prefix receipt without waiting for later games.
 * @returns {void}
 */
function persist() {
	const payload = {
		generatedAt: new Date().toISOString(),
		publicRoot: 'geelooy/',
		results
	};
	if (outputPath) {
		fs.mkdirSync(path.dirname(outputPath), { recursive: true });
		fs.writeFileSync(
			outputPath,
			`${JSON.stringify(payload, null, 2)}\n`
		);
		return;
	}
	console.log(JSON.stringify(payload, null, 2));
}

/**
 * Parses slug arguments and the optional receipt destination.
 * @param {string[]} argumentsList Raw command-line arguments after the script name.
 * @returns {{slugs: string[], outputPath: string|null}} Normalized runner arguments.
 */
function parseArguments(argumentsList) {
	const values = [...argumentsList];
	const outputIndex = values.indexOf('--output');
	let resolvedOutputPath = null;
	if (outputIndex >= 0) {
		const rawPath = values[outputIndex + 1];
		if (!rawPath) {
			throw new Error('--output requires a path');
		}
		resolvedOutputPath = path.resolve(rawPath);
		values.splice(outputIndex, 2);
	}
	return {
		slugs: values.filter(Boolean),
		outputPath: resolvedOutputPath
	};
}
