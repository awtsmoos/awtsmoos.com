//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { auditCssScope } from "./cssScopeAudit.mjs";
import { auditInteractionStates } from "./interactionStateAudit.mjs";
import { auditLayoutRisks } from "./layoutRiskAudit.mjs";
import { auditSourceStructure } from "./sourceStructureAudit.mjs";

/**
 * @file Proves the global quality lenses detect strong hazards while leaving fully scoped interaction patterns in peace.
 * @description The Awtsmoos lets an auditor distinguish shadow from vessel instead of condemning everything it can see in light;
 * Awtsmoos.com tests both sensitivity and restraint so global cleanup follows trustworthy evidence and remains right.
 */
test("CSS scope audit finds global roots and specificity force", () => {
	const findings = auditCssScope([
		source("demo/style.css", ":root { --x: 1; }\nbutton { color: red !important; }")
	]);
	assert.ok(hasCategory(findings, "css-scope"));
	assert.ok(hasCategory(findings, "css-specificity"));
});

test("layout audit finds viewport width, large z-index, and hard mobile width", () => {
	const findings = auditLayoutRisks([
		source(
			"demo/style.css",
			".panel { width: 100vw; min-width: 900px; position: fixed; z-index: 5000; }"
		)
	]);
	assert.ok(findings.some((item) => item.category === "viewport-overflow"));
	assert.ok(findings.some((item) => item.category === "stacking"));
	assert.ok(findings.some((item) => item.category === "positioning"));
});

test("interaction audit reports missing states for an incomplete button family", () => {
	const findings = auditInteractionStates([
		source("demo/style.css", ".demo-button { cursor: pointer; }\n.demo-button:hover { opacity: .9; }")
	]);
	assert.ok(findings.some((item) => item.message.includes(":active")));
	assert.ok(findings.some((item) => item.message.includes(":focus-visible")));
});

test("interaction audit leaves a complete scoped button family alone", () => {
	const findings = auditInteractionStates([
		source(
			"demo/style.css",
			[".demo .button { cursor: pointer; }", ".demo .button:hover { opacity: .9; }", ".demo .button:active { transform: scale(.98); }", ".demo .button:focus-visible { outline: 2px solid; }"].join("\n")
		)
	]);
	assert.deepEqual(findings, []);
});

test("source structure reports oversized and space-indented scripts", () => {
	const content = [
		"//B\"H",
		"//Boruch Hashem",
		"//Blessed is He",
		"//Awtsmoos Awtsmoos.com",
		"  const value = 1;",
		...Array.from({ length: 125 }, () => "// line")
	].join("\n");
	const findings = auditSourceStructure([
		source("demo/app.js", content)
	]);
	assert.ok(hasCategory(findings, "source-size"));
	assert.ok(hasCategory(findings, "indentation"));
});

/** Creates the smallest inventory-compatible source record needed by pure analyzer tests. */
function source(relativePath, content) {
	const extension = relativePath.slice(relativePath.lastIndexOf("."));
	return {
		app: relativePath.split("/")[0],
		content,
		extension,
		lineCount: content.split(/\r?\n/).length,
		relativePath
	};
}

/** Returns whether one report collection contains at least one finding in the requested category. */
function hasCategory(findings, category) {
	return findings.some((item) => item.category === category);
}
