//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file project-tutorial-renderer.js
 * @description The Awtsmoos turns bounded project evidence into readable teaching while every dependency, test, symbol, and public-entry claim keeps its lexical provenance.
 */

const Render = require("./render.js");

function bullet(values, formatter, empty = "None observed.") {
	if (!values?.length) return empty;
	return values.slice(0, 8).map(value => `- ${formatter(value)}`).join("\n");
}

function fileCounts(record) {
	return Render.markdownTable(
		["Source", "Tests", "Assets", "Generated", "Docs", "Other", "Total"],
		[[record.counts.source, record.counts.tests, record.counts.assets, record.counts.generated, record.counts.docs, record.counts.other, record.totalFiles]]
	);
}

function dependencyLine(edge) {
	return `\`${edge.project}\` — ${edge.count} lexical reference${edge.count === 1 ? "" : "s"}${edge.examples ? `; examples: ${edge.examples}` : ""}`;
}

function externalLine(edge) {
	return `\`${edge.dependency}\` — ${edge.count} lexical reference${edge.count === 1 ? "" : "s"}`;
}

function entryLine(entry) {
	return `\`${entry.url}\` → \`${entry.file}\`${entry.title ? ` — ${entry.title}` : ""}`;
}

function symbolText(summary) {
	if (!summary) return "No lexical symbol summary observed.";
	return `Source files: ${summary.files}; classes: ${summary.classes}; functions: ${summary.functions}; exports: ${summary.exports}; samples: ${summary.samples?.join(", ") || "—"}.`;
}

function routeBody(record) {
	const manual = `../../../TUTORIALS/PROJECTS/${record.humanManual.split("/").pop()}`;
	const local = record.localDoc ? `\`${record.localDoc}\`` : "No local `DOCUMENTATION.md` observed.";
	return [
		`# Project Tutorial: ${record.title}`,
		"",
		`**Path:** \`${record.path}\` · **Type:** ${record.type} · **Family:** ${record.family.title}`,
		"",
		`[Read the human ${record.family.title} guide](${manual})`,
		"",
		"> Generated project evidence is a navigation aid. Imports, symbols, tests, and public entries are lexical observations, not runtime ownership or health guarantees.",
		"",
		"## Entry and documentation evidence",
		"",
		`- Entry files: ${record.entries.length ? record.entries.map(value => `\`${value}\``).join(", ") : "—"}`,
		`- Local documentation: ${local}`,
		`- Local-doc requirement: ${record.requiresLocalDoc ? "yes" : "no"}; covered: ${record.documentationCovered ? "yes" : "no"}`,
		`- Symlink target: ${record.symlinkTarget ? `\`${record.symlinkTarget}\`` : "—"}`,
		"",
		"## File shape",
		"",
		fileCounts(record),
		"",
		"## Public entry points",
		"",
		bullet(record.publicEntries, entryLine),
		"",
		"## Symbol evidence",
		"",
		symbolText(record.symbolSummary),
		"",
		"## Depends on",
		"",
		bullet(record.outgoing, dependencyLine),
		"",
		"## Used by",
		"",
		bullet(record.incoming, dependencyLine),
		"",
		"## External packages",
		"",
		bullet(record.externalDependencies, externalLine),
		"",
		"## Verification clue",
		"",
		`Observed test-classified files: **${record.counts.tests}**. Treat this as file evidence, not proof of behavioral coverage.`
	].join("\n");
}

module.exports = { routeBody };
