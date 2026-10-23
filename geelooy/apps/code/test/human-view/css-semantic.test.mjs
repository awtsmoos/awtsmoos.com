//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import { test } from "node:test";
import { analyzeCss } from "../../js/features/human-view/analysis/css/projector.js";
import { scanCss } from "../../js/features/human-view/analysis/css/scanner.js";

const FILE = { name: "responsive.css", path: "responsive.css", tabId: "css-test" };

test("CSS scanner ignores structural-looking text inside comments and strings", () => {
	const source = `/* @media (max-width: 999px) { fake {} } */
.card::before { content: "{ @media (max-width: 555px) }"; }
@media (max-width: 768px) { .card { display: grid; gap: 12px; } }`;
	const result = scanCss(source);
	const media = result.blocks.filter(block => block.prelude?.text.startsWith("@media"));
	assert.equal(media.length, 1);
	assert.match(media[0].prelude.text, /768px/);
	assert.deepEqual(result.warnings, []);
});

test("CSS projector creates one exact stable breakpoint decision", async () => {
	const source = `.card { display: grid; }
@media (max-width: 768px) { .card { display: block; } }`;
	const first = await analyzeCss({ file: FILE, source, sourceRevision: "one" });
	const second = await analyzeCss({ file: FILE, source, sourceRevision: "two" });
	const decision = first.sections.flatMap(section => section.nodes).find(node => node.decision?.kind === "css-breakpoint");
	const repeated = second.sections.flatMap(section => section.nodes).find(node => node.decision?.kind === "css-breakpoint");
	assert.ok(decision);
	assert.equal(decision.decision.value, "768");
	assert.equal(decision.decision.unit, "px");
	assert.equal(decision.source.original, "768");
	assert.equal(source.slice(decision.source.start, decision.source.end), "768");
	assert.equal(decision.id, repeated.id);
	assert.equal(first.purpose.status, "unresolved");
});

test("CSS scanner reports malformed block structure", () => {
	const result = scanCss(".card { display: grid;");
	assert.equal(result.warnings.length, 1);
	assert.match(result.warnings[0].message, /Unclosed block/);
});
