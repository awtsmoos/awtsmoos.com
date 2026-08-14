#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

const childProcess = require("node:child_process");
const Policy = require("./sourceOnlyPolicy.js");

/**
 * Report tracked payload that violates the source-only deploy covenant.
 * Pass --enforce only after Stage B externalization removes every listed violation.
 */
function main() {
	const enforce = process.argv.includes("--enforce");
	const entries = headEntries(process.cwd());
	const violations = Policy.violations(entries);
	const report = {
		ok: !enforce || violations.length === 0,
		mode: enforce ? "enforce" : "report",
		trackedFiles: entries.length,
		violations: violations.length,
		violationBytes: violations.reduce((sum, item) => sum + item.bytes, 0),
		items: violations
	};
	process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
	if (!report.ok) process.exitCode = 2;
}

function headEntries(cwd) {
	const output = childProcess.execFileSync("git", ["ls-tree", "-r", "--long", "HEAD"], {
		cwd,
		encoding: "utf8",
		maxBuffer: 64 * 1024 * 1024
	});
	return output.split("\n").filter(Boolean).map(parseLine).filter(Boolean);
}

function parseLine(line) {
	const match = line.match(/^\d+\s+\w+\s+[0-9a-f]+\s+(\d+)\t(.+)$/i);
	return match ? { bytes: Number(match[1]), path: match[2] } : null;
}

if (require.main === module) main();
module.exports = { headEntries, main, parseLine };
