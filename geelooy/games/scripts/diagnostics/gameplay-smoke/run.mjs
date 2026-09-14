//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file run.mjs
 * @description Executes isolated real-gameplay smoke probes and persists every
 * completed receipt before the next title begins.
 *
 * Architectural invariants:
 * - One static public-root server may be shared; browser targets never are.
 * - Probe selection is explicit and rejects unknown slugs.
 * - A title passes only after canonical gameplay changes without browser faults.
 * - Completed evidence is written incrementally when an output path is supplied.
 */
import fs from 'node:fs';
import path from 'node:path';
import { KeliPublicRootServer } from '../ui-crawl/server.mjs';
import { runProbeIsolated } from './isolated-probe.mjs';
import { GAMEPLAY_PROBES } from './probes/index.mjs';

const { slugs, outputPath } = parseArguments(process.argv.slice(2));
const selected = selectProbes(slugs);
const server = new KeliPublicRootServer();
const results = [];

try {
	await server.start();
	for (const probe of selected) {
		const result = await runProbeIsolated(server.origin, probe);
		results.push(result);
		persist();
		console.log(`${probe.slug}: PLAY OK`);
	}
} finally {
	server.stop();
}

/** Persist the completed-prefix receipt without waiting for later probes. */
function persist() {
	const payload = {
		generatedAt: new Date().toISOString(),
		results
	};
	if (!outputPath) {
		return;
	}
	fs.mkdirSync(path.dirname(outputPath), { recursive: true });
	fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`);
}

/** Resolve requested slugs against the known real-gameplay probe registry. */
function selectProbes(requested) {
	if (!requested.length) {
		return GAMEPLAY_PROBES;
	}
	const index = new Map(GAMEPLAY_PROBES.map(probe => [probe.slug, probe]));
	return requested.map(slug => {
		const probe = index.get(slug);
		if (!probe) {
			throw new Error(`Unknown gameplay smoke probe: ${slug}`);
		}
		return probe;
	});
}

/** Parse optional receipt destination plus zero or more selected slugs. */
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
