//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import { test } from "node:test";
import { analyzeHtml } from "../../js/features/human-view/analysis/html/projector.js";
import { scanHtml } from "../../js/features/human-view/analysis/html/scanner.js";

const FILE = { name: "page.html", path: "page.html", tabId: "html-test" };

const SOURCE = `<!doctype html>
<html>
<head><title>Human Page</title><style>.x::after { content: "<main>fake</main>"; }</style></head>
<body>
<nav aria-label="Primary"><a href="/home">Home</a></nav>
<main><h1>Dashboard</h1><form><button type="submit">Save</button></form></main>
<script>const fake = "<button>Not real</button>";</script>
</body>
</html>`;

test("HTML scanner skips fake tags inside raw script and style text", () => {
	const result = scanHtml(SOURCE);
	const tags = result.elements.map(element => element.tag);
	assert.equal(tags.filter(tag => tag === "main").length, 1);
	assert.equal(tags.filter(tag => tag === "button").length, 1);
	assert.equal(tags.filter(tag => tag === "script").length, 1);
	assert.equal(tags.filter(tag => tag === "style").length, 1);
	assert.deepEqual(result.warnings, []);
});

test("HTML projector produces source-linked structural sections without purpose inference", async () => {
	const documentModel = await analyzeHtml({ file: FILE, source: SOURCE, sourceRevision: "html-one" });
	const sectionTitles = documentModel.sections.map(section => section.title);
	assert.ok(sectionTitles.includes("Page identity"));
	assert.ok(sectionTitles.includes("Landmarks"));
	assert.ok(sectionTitles.includes("Headings"));
	assert.ok(sectionTitles.includes("Forms & controls"));
	assert.ok(sectionTitles.includes("Links"));
	assert.equal(documentModel.purpose.status, "unresolved");
	const nodes = documentModel.sections.flatMap(section => section.nodes);
	const button = nodes.find(node => node.kind === "control" && node.label === "Save");
	assert.ok(button);
	assert.equal(SOURCE.slice(button.source.start, button.source.end).startsWith("<button"), true);
	assert.equal(nodes.filter(node => node.kind === "control" && node.label === "Not real").length, 0);
});
