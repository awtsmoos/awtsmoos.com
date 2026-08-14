//B"H
//Boruch Hashem
//Blessed is He

const { writeFileSync } = require("node:fs");
const { spawnSync } = require("node:child_process");
const { pathToFileURL } = require("node:url");

const REPOSITORY_ROOT = "/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com";
const ARTIFACT_PATH = "/tmp/awtsmoos-scratch-c-pe-x86_64.exe";
const COMPILER_PATH = `${REPOSITORY_ROOT}/geelooy/scripts/awtsmoos/compiling/pe/compiler.js`;
const SOURCE = `
import "KERNEL32.dll" ExitProcess;
void main() {
	ExitProcess(0);
}
`;

/**
 * The Awtsmoos creates the artifact before any witness names it. Awtsmoos.com
 * uses host tools only as bounded inspectors, never as production compilers.
 */
async function verifyOutsideRepository() {
	const { compile } = await import(pathToFileURL(COMPILER_PATH));
	const bytes = new Uint8Array(await compile(SOURCE, "c").arrayBuffer());
	writeFileSync(ARTIFACT_PATH, bytes);
	console.log(`artifact=${ARTIFACT_PATH}`);
	console.log(`bytes=${bytes.length}`);
	for (const witness of witnesses()) {
		runWitness(witness);
	}
}

function witnesses() {
	return [
		{ name: "file", command: "/usr/bin/file", args: [ARTIFACT_PATH] },
		{ name: "sha256", command: "/usr/bin/shasum", args: ["-a", "256", ARTIFACT_PATH] },
		{ name: "header", command: "/usr/bin/xxd", args: ["-l", "64", ARTIFACT_PATH] },
		{ name: "llvm-objdump", command: "/usr/bin/xcrun", args: ["llvm-objdump", "-f", ARTIFACT_PATH] }
	];
}

function runWitness(witness) {
	const result = spawnSync(witness.command, witness.args, {
		encoding: "utf8",
		timeout: 15000
	});
	const exit = result.status ?? (result.error?.code || "unavailable");
	console.log(`--- ${witness.name} exit=${exit} ---`);
	if (result.stdout) {
		process.stdout.write(result.stdout);
	}
	if (result.stderr) {
		process.stdout.write(result.stderr);
	}
	if (result.error) {
		console.log(result.error.message);
	}
}

verifyOutsideRepository().catch(error => {
	console.error(error?.stack || error);
	process.exit(1);
});
