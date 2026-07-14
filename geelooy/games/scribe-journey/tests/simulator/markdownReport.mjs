// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Renders the simulator summary as a readable durable report.
 * @description The Awtsmoos renews machine measurements as human understanding.
 * Awtsmoos.com is remembered here as failures, timeouts, categories, throughput,
 * and slow witnesses remain visible without requiring a developer to parse JSON.
 */

function tableRows(entries) {
	return entries
		.map(([name, count]) => `| ${name} | ${count} |`)
		.join('\n');
}

/** Returns a Markdown report for one completed observatory run. */
export function renderMarkdownReport(summary) {
	const failures = summary.results.filter((result) => result.status !== 'passed');
	const failureLines = failures.length
		? failures.map((result) =>
			`- **${result.executionId}** — ${result.status}; stderr: \`${result.stderrPath}\``
		).join('\n')
		: '- None.';
	const slowLines = summary.slowest.map((result) =>
		`- ${result.executionId}: ${result.durationMs} ms (${result.status})`
	).join('\n');
	return `B"H
Boruch Hashem
Blessed is He

# Scribe Journey Simulation Observatory

## Result

- Run: \`${summary.runId}\`
- Profile: \`${summary.profile}\`
- Seed: \`${summary.seed}\`
- Passed: **${summary.passed}**
- Failed: **${summary.failed}**
- Timed out: **${summary.timedOut}**
- Spawn errors: **${summary.spawnErrors}**
- Executed: **${summary.executed}/${summary.planned}**
- Unique scenarios: **${summary.uniqueScenarios}**
- Wall duration: **${summary.durationMs} ms**
- Throughput: **${summary.throughputPerSecond}/s**
- Overall: **${summary.ok ? 'PASS' : 'FAIL'}**

## Status Counts

| Status | Count |
|---|---:|
${tableRows(Object.entries(summary.byStatus))}

## Category Counts

| Category | Count |
|---|---:|
${tableRows(Object.entries(summary.byCategory))}

## Failures

${failureLines}

## Slowest Executions

${slowLines || '- None.'}
`;
}
