// B"H
import fs from 'node:fs';
import path from 'node:path';

function markdownPair(pair) {
	const status = pair.issues.length ? `⚠ ${pair.issues.join(', ')}` : '✓ no automatic flags';
	return `### ${pair.key} — ${status}\n\n**Source:** ${pair.source}\n\n**English:** ${pair.english}\n`;
}

export function writeReports(outputBase, audit) {
	fs.mkdirSync(path.dirname(outputBase), { recursive: true });
	fs.writeFileSync(`${outputBase}.json`, `${JSON.stringify(audit, null, 2)}\n`);
	const lines = [
		'# Sichos Kodesh Random Translation Audit',
		'',
		`Generated: ${audit.generatedAt}`,
		`Seed: \`${audit.seed}\``,
		`Documents sampled: ${audit.summary.documents}`,
		`Paragraphs reviewed: ${audit.summary.paragraphs}`,
		`Structural failures: ${audit.summary.structuralFailures}`,
		`Automatic review flags: ${audit.summary.flags}`,
		'',
		'> Automatic flags identify passages needing human reading; they are not proof of mistranslation.',
		''
	];
	for (const document of audit.documents) {
		lines.push(`## ${document.title}`, '', `Document: \`${document.documentId}\``,
			`Structural validation: **${document.validation.ok ? 'PASS' : 'FAIL'}**`, '');
		for (const pair of document.sampledPairs) lines.push(markdownPair(pair));
	}
	fs.writeFileSync(`${outputBase}.md`, `${lines.join('\n')}\n`);
	return { json: `${outputBase}.json`, markdown: `${outputBase}.md` };
}
