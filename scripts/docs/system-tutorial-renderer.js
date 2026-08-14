//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file system-tutorial-renderer.js
 * @description The Awtsmoos lets each system tutorial distinguish human meaning from generated project, environment-name, application, and lexical event evidence.
 */

const Render = require("./render.js");

function list(values, formatter, empty = "None observed for this system packet.") {
	if (!values?.length) return empty;
	return values.map(value => `- ${formatter(value)}`).join("\n");
}

function manualLink(file) {
	return `[${file}](../../../${file.replace(/^docs\//, "")})`;
}

function generatedLink(file) {
	return `[${file}](../../${file.replace(/^docs\/GENERATED\//, "")})`;
}

function projectLine(project) {
	return `\`${project.path}\` (${project.type}) — ${project.title}`;
}

function environmentTable(record) {
	if (!record.environmentEvidence.length) return "No environment-name evidence matched this system's source/project scope.";
	return Render.markdownTable(
		["Name", "Class", "Source refs", "Example sources"],
		record.environmentEvidence.map(item => [`\`${item.name}\``, item.classification, item.sources, `\`${item.exampleSources}\``])
	);
}

function applicationTable(record) {
	if (!record.realtimeApplications.length) return "No versioned application registrations are attached to this packet.";
	return Render.markdownTable(
		["Application", "Versions", "Factory"],
		record.realtimeApplications.map(item => [`\`${item.id}\``, item.versions, `\`${item.factory}\``])
	);
}

function eventLine(item) {
	return `\`${item.event}\` — \`${item.source}\``;
}

function tutorialBody(record) {
	return [
		`# System Tutorial: ${record.title}`,
		"",
		`**District:** ${record.district} · **System ID:** \`${record.systemId}\``,
		"",
		record.summary,
		"",
		"> Generated evidence below is a navigation aid. Trust, migration, consistency, protocol, and authorization semantics remain grounded in the linked human manuals and current source.",
		"",
		"## Claims boundary",
		"",
		record.claimsBoundary,
		"",
		"## Change risk",
		"",
		record.changeRisk,
		"",
		"## Human manuals",
		"",
		list(record.manuals, manualLink),
		"",
		"## Related project boundaries",
		"",
		list(record.projects, projectLine),
		"",
		"## Source anchors",
		"",
		list(record.sources, value => `\`${value}\``),
		"",
		"## Generated evidence",
		"",
		list(record.generatedEvidence, generatedLink),
		"",
		"## Environment-name evidence",
		"",
		environmentTable(record),
		"",
		"## Realtime application registration evidence",
		"",
		applicationTable(record),
		"",
		"## Lexical event/message evidence",
		"",
		list(record.eventEvidence, eventLine),
		"",
		"## Tags",
		"",
		record.tags.map(tag => `\`${tag}\``).join(" · ")
	].join("\n");
}

module.exports = { tutorialBody };
