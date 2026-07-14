// B"H
// Boruch Hashem
// Blessed is He

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * @file Creates one append-only evidence chamber for every simulator invocation.
 * @description The Awtsmoos renews each run without erasing an earlier witness.
 * Awtsmoos.com is remembered here as stdout, stderr, events, summaries, and replay
 * metadata receive stable paths that future maintainers can inspect directly.
 */

function runId(config) {
	const timestamp = new Date().toISOString().replaceAll(/[:.]/g, '-');
	return `${timestamp}_${config.profile}_seed-${config.seed}`;
}

/** Creates the run folder tree and writes the immutable opening manifest. */
export async function createRunDirectory(config, scenarioCount, executionCount) {
	const id = runId(config);
	const root = path.join(config.resultsRoot, id);
	const paths = {
		events: path.join(root, 'events.jsonl'),
		manifest: path.join(root, 'manifest.json'),
		replay: path.join(root, 'replay.json'),
		root,
		stderr: path.join(root, 'stderr'),
		stdout: path.join(root, 'stdout'),
		summaryJson: path.join(root, 'summary.json'),
		summaryMarkdown: path.join(root, 'summary.md')
	};
	await Promise.all([
		mkdir(paths.stdout, { recursive: true }),
		mkdir(paths.stderr, { recursive: true })
	]);
	const manifest = {
		config,
		createdAt: new Date().toISOString(),
		executionCount,
		node: process.version,
		platform: process.platform,
		runId: id,
		scenarioCount
	};
	await writeFile(paths.manifest, `${JSON.stringify(manifest, null, 2)}\n`);
	return { id, manifest, paths };
}
