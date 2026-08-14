//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file tutorial-renderer.js
 * @description The Awtsmoos turns route evidence into bounded teaching pages while every uncertainty remains visible beside the example.
 */

const Render = require("./render.js");

function list(values, fallback = "—") {
	return values?.length ? values.map(value => `\`${value}\``).join(", ") : fallback;
}

function parameterSection(record) {
	if (!record.pathParameters.length) return "## Path parameters\n\nNone.";
	const rows = record.pathParameters.map(item => [
		`\`${item.name}\``,
		item.catchAll ? "terminal catch-all" : "single segment"
	]);
	return `## Path parameters\n\n${Render.markdownTable(["Name", "Shape"], rows)}`;
}

function exampleSection(record) {
	if (!record.examples.length) {
		return "## Starter call\n\nNo executable starter is generated because method evidence is unknown. Inspect the source handler before choosing a method or payload.";
	}
	const example = record.examples[0];
	return [
		"## Starter call",
		"",
		`> ${example.warning}`,
		"",
		"```sh",
		example.curl,
		"```",
		"",
		"```js",
		example.fetch,
		"```"
	].join("\n");
}

function callerSection(record) {
	if (!record.callers.length) return "## Observed callers\n\nNo matching literal caller evidence was found.";
	const rows = record.callers.slice(0, 6).map(item => [
		`\`${item.literal}\``, `\`${item.source}\``, item.kind
	]);
	return `## Observed callers\n\nPattern-compatible evidence only; it does not prove runtime dispatch.\n\n${Render.markdownTable(["Literal", "Source", "Kind"], rows)}`;
}

function testSection(record) {
	if (!record.tests.length) return "## Related tests\n\nNo package-script heuristic match was found.";
	return `## Related tests\n\nHeuristic family matches:\n\n${record.tests.slice(0, 5).map(item => `- \`${item.name}\` — \`${item.command}\``).join("\n")}`;
}

function relatedSection(record) {
	if (!record.related.length) return "## Related routes\n\nNone generated.";
	return `## Related routes\n\n${record.related.map(item => `- [\`${item.route}\`](./${item.id}.md)`).join("\n")}`;
}

function routeBody(record) {
	const health = record.derech?.status || "unknown";
	const manual = `../../../TUTORIALS/API/${record.family.manual.split("/").pop()}`;
	return [
		`# API Tutorial: ${record.route}`,
		"",
		`**Family:** ${record.family.title} · **Mount:** \`${record.family.mount}\` · **Derech health:** ${health}`,
		"",
		`**Source:** \`${record.source}\` · **Discovery:** ${record.discoveryKind} · **Confidence:** ${record.confidence}`,
		"",
		`[Read the human ${record.family.title} tutorial](${manual})`,
		"",
		"> Generated evidence is a navigation and teaching aid, not an OpenAPI contract. Unknown evidence stays unknown; inspect current source/tests before production use.",
		"",
		"## Contract evidence",
		"",
		`- Methods: ${record.methodEvidence === "unknown" ? "**unknown**" : list(record.methods)}`,
		`- Request vessels: ${list(record.vessels)}`,
		`- Observed status literals: ${list(record.statuses)}`,
		`- Observed headers: ${list(record.headers)}`,
		"",
		parameterSection(record),
		"",
		exampleSection(record),
		"",
		callerSection(record),
		"",
		testSection(record),
		"",
		relatedSection(record)
	].join("\n");
}

module.exports = { routeBody };
