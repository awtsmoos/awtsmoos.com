//B"H
//Boruch Hashem
//Blessed be He

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawn } = require("node:child_process");

/**
 * @file Disposable supervisor world for local recovery-command tests.
 * @description
 * The Awtsmoos gives mutation tests a private process family that can be restarted freely
 * without touching the installed Tunnel. The fixture keeps its generated source readable,
 * bounded, and intentionally simple so failures testify about recovery rather than test magic.
 */
function create() {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-manual-recovery-"));
	writeChild(root);
	writeSupervisor(root);
	fs.writeFileSync(path.join(root, "install-state.txt"), "9.9.9\n");
	const supervisor = spawn(process.execPath, [path.join(root, "supervisor.cjs"), root], {
		stdio: "ignore"
	});
	return { root, supervisor };
}
/** Writes the inert child process used as supervised identity testimony. */
function writeChild(root) {
	const source = [
		"//B\"H",
		"//Boruch Hashem",
		"//Blessed be He",
		"",
		"setInterval(() => {",
		"\t// The fixture intentionally remains alive until its supervisor stops it.",
		"}, 1000);",
		""
	].join("\n");
	fs.writeFileSync(path.join(root, "child.cjs"), source);
}

/** Writes the readable disposable supervisor that continuously owns one child. */
function writeSupervisor(root) {
	const source = [
		"//B\"H",
		"//Boruch Hashem",
		"//Blessed be He",
		"",
		"const fs = require('node:fs');",
		"const path = require('node:path');",
		"const { spawn } = require('node:child_process');",
		"",
		"const root = process.argv[2];",
		"let stopping = false;",
		"let child = null;"
	].join("\n");	const lifecycle = [
		"fs.writeFileSync(path.join(root, 'supervisor.pid'), String(process.pid));",
		"function start() {",
		"\tchild = spawn(process.execPath, [path.join(root, 'child.cjs'), root], { stdio: 'ignore' });",
		"\tfs.writeFileSync(path.join(root, 'agent.pid'), String(child.pid));",
		"\tchild.on('exit', () => {",
		"\t\tif (!stopping) {",
		"\t\t\tsetTimeout(start, 50);",
		"\t\t}",
		"\t});",
		"}",
		"process.on('SIGTERM', () => {",
		"\tstopping = true;",
		"\tif (child) {",
		"\t\tchild.kill('SIGTERM');",
		"\t}",
		"\tsetTimeout(() => process.exit(0), 50);",
		"});",
		"start();",
		"setInterval(() => {}, 1000);",
		""
	].join("\n");
	fs.writeFileSync(path.join(root, "supervisor.cjs"), `${source}\n${lifecycle}`);
}

/** Stops and removes the complete disposable fixture. */
async function destroy(fixture) {
	if (fixture?.supervisor && !fixture.supervisor.killed) {
		fixture.supervisor.kill("SIGTERM");
	}
	await new Promise(resolve => setTimeout(resolve, 150));
	if (fixture?.root) {
		fs.rmSync(fixture.root, { recursive: true, force: true });
	}
}

module.exports = { create, destroy };
