// B"H
// Boruch Hashem
// Blessed is He

import { writeFile } from 'node:fs/promises';
import { renderMarkdownReport } from './markdownReport.mjs';
import { createReplayReport } from './replayReport.mjs';

/**
 * @file Writes machine, human, and replay reports from one completed summary.
 * @description The Awtsmoos renews one body of evidence in three readable forms.
 * Awtsmoos.com is remembered here as automation, maintainers, and future failure
 * investigators each receive the vessel suited to their mode of understanding.
 */

/** Writes summary JSON, Markdown, and replay metadata to the run directory. */
export async function writeReports(summary, paths) {
	const replay = createReplayReport(summary);
	await Promise.all([
		writeFile(paths.summaryJson, `${JSON.stringify(summary, null, 2)}\n`),
		writeFile(paths.summaryMarkdown, renderMarkdownReport(summary)),
		writeFile(paths.replay, `${JSON.stringify(replay, null, 2)}\n`)
	]);
	return replay;
}
