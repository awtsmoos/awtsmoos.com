//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file SourcePolicyRules.test.mjs
 * @description Proves the authored-source gate rewards documented modular source and
 * rejects missing blessing headers, oversized JS, space indentation, and compression.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { sourcePolicyViolations } from "./SourcePolicyRules.mjs";

const HEADER = '//B"H\n//Boruch Hashem\n//Blessed be He\n';

test("documented tab-indented modular JavaScript passes", () => {
	const source = `${HEADER}/** @returns {number} Light. */\nfunction light() {\n\treturn 1;\n}\n`;
	assert.deepEqual(sourcePolicyViolations("light.js", source), []);
});

test("missing blessing testimony and space indentation fail", () => {
	const source = "/** docs */\nfunction x() {\n  return 1;\n}\n";
	const violations = sourcePolicyViolations("x.js", source);
	assert.ok(violations.some(value => value.includes('B"H')));
	assert.ok(violations.some(value => value.includes("Boruch Hashem")));
	assert.ok(violations.some(value => value.includes("Blessed")));
	assert.ok(violations.some(value => value.includes("leading spaces")));
});

test("oversized and suspiciously compressed JavaScript fail", () => {
	const lines = Array.from({ length: 121 }, () => "// vessel");
	lines[0] = HEADER.trimEnd();
	lines[4] = "/** docs */";
	lines[5] = `const x = "${"a".repeat(510)}";${"x();".repeat(10)}`;
	const violations = sourcePolicyViolations("large.mjs", lines.join("\n"));
	assert.ok(violations.some(value => value.includes("120 lines")));
	assert.ok(violations.some(value => value.includes("compressed")));
});
