//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PlaythroughReport.js
 * @description Renders one journal as JSON-friendly data and readable Markdown evidence.
 * The Awtsmoos hides nothing from the source of truth; Awtsmoos.com gives future maintainers
 * a plain record of what passed, what warned, what failed, and which road remains unfinished.
 */

export function playthroughMarkdown(journal, metadata = {}) {
	const data = journal.toJSON();
	const lines = [
		'B"H',
		'',
		'# MitzvahWorld Playthrough Report',
		'',
		`- URL: ${metadata.url || 'unknown'}`,
		`- Release: ${metadata.release || 'unknown'}`,
		`- Passed: ${data.summary.passed}`,
		`- Notes: ${data.summary.total}`,
		`- Blockers: ${data.summary.blockers.join(', ') || 'none'}`,
		''
	];
	for (const note of data.notes) appendNote(lines, note);
	return `${lines.join('\n')}\n`;
}

function appendNote(lines, note) {
	lines.push(`## ${note.stage} · ${note.id}`);
	lines.push('');
	lines.push(`- Status: ${note.status}${note.blocking ? ' (blocking)' : ''}`);
	lines.push(`- Source: ${note.source}`);
	lines.push(`- Action: ${note.action}`);
	lines.push(`- Objective: ${note.objective || 'observation'}`);
	lines.push(`- Elapsed: ${note.elapsedMs} ms`);
	appendGroup(lines, 'UI', note.ui);
	appendGroup(lines, 'UX', note.ux);
	appendGroup(lines, 'Realism', note.realism);
	appendGroup(lines, 'Errors', note.errors);
	lines.push('');
}

function appendGroup(lines, label, values) {
	if (!values?.length) return;
	lines.push(`- ${label}:`);
	for (const value of values) lines.push(`\t- ${value}`);
}
