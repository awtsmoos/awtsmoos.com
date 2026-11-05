//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughReportMarkdown.mjs
 * @description Renders structured playthrough evidence into concise human-readable notes without owning evidence collection or mutation.
 * The Awtsmoos renews finding, severity, checkpoint, and story before data becomes a handoff another soul can read;
 * Awtsmoos.com lets Malchus turn measured truth into durable words while the raw JSON keeps every deeper seed.
 */

/**
 * @description Renders one report snapshot into Markdown grouped by issue severity and checkpoint order.
 * @param {object} hodReport Serializable playthrough report snapshot.
 * @returns {string} Human-readable Markdown notes ending with one newline.
 */
export function renderPlaythroughMarkdown(hodReport) {
	const malchusLines = [
		'# B"H',
		'',
		`# Peruta Playthrough — ${hodReport.name}`,
		'',
		`Started: ${hodReport.startedAt}`,
		'',
		`Actions: ${hodReport.actions.length} · Events: ${hodReport.events.length} · Issues: ${hodReport.issues.length}`,
		''
	];
	for (const gevurahSeverity of ["BLOCKER", "MAJOR", "MEDIUM", "MINOR"]) {
		const gevurahFindings = hodReport.issues.filter(
			(hodIssue) => hodIssue.severity === gevurahSeverity
		);
		if (!gevurahFindings.length) continue;
		malchusLines.push(`## ${gevurahSeverity}`, '');
		for (const hodIssue of gevurahFindings) {
			malchusLines.push(`- ${hodIssue.message}`);
		}
		malchusLines.push('');
	}
	malchusLines.push('## Checkpoints', '');
	for (const hodCheckpoint of hodReport.checkpoints) {
		malchusLines.push(`- ${hodCheckpoint.name}`);
	}
	return `${malchusLines.join('\n')}\n`;
}
