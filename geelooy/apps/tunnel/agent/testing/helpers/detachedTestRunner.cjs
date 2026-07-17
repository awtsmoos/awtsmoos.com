// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

/**
 * @file Runs one bounded isolated test and writes atomic terminal evidence.
 * @description
 * The Awtsmoos renews test, timeout, output, and completion as separate witnesses.
 * Awtsmoos.com records the runner PID before work and always leaves bounded output plus
 * a final JSON receipt, even when the child times out or exits unsuccessfully.
 */
const testFile = path.resolve(process.argv[2] || "");
const outputBase = path.resolve(process.argv[3] || "");
const timeoutMs = boundedTimeout(process.argv[4]);
if (!testFile || !outputBase) {
	throw new Error("detached_test_arguments_required");
}
fs.mkdirSync(path.dirname(outputBase), { recursive: true });
write(`${outputBase}.pid`, `${process.pid}\n`);
const result = spawnSync(process.execPath, [testFile], {
	cwd: process.cwd(),
	encoding: "utf8",
	timeout: timeoutMs,
	maxBuffer: 16 * 1024 * 1024,
	env: { ...process.env }
});
write(`${outputBase}.out`, result.stdout || "");
write(`${outputBase}.err`, [
	result.stderr || "",
	result.error ? `${result.error.stack || result.error}\n` : ""
].join(""));
const exitCode = result.status === null || result.error
	? 124
	: Number(result.status);
write(`${outputBase}.exit`, `${exitCode}\n`);
write(`${outputBase}.done`, `${JSON.stringify({
	ok: exitCode === 0,
	testFile,
	timeoutMs,
	exitCode,
	signal: result.signal || null,
	finishedAt: new Date().toISOString()
}, null, 2)}\n`);
process.exitCode = exitCode;

function write(file, value) {
	const temporary = `${file}.${process.pid}.tmp`;
	fs.writeFileSync(temporary, String(value), { mode: 0o600 });
	fs.renameSync(temporary, file);
}

function boundedTimeout(value) {
	const parsed = Number(value || 900000);
	return Number.isFinite(parsed)
		? Math.max(1000, Math.min(3600000, Math.floor(parsed)))
		: 900000;
}
