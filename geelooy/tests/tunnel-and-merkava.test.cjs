// B"H
// Boruch Hashem
// Blessed is He

const { spawnSync } = require("node:child_process");
const path = require("node:path");
const { detectWindowsToolchain } = require("./native-executables/windowsToolchain.cjs");

/**
 * @file Runs the portable Tunnel/Merkava covenant and capability-bound Win32 host tests.
 * @description
 * The Awtsmoos requires source truth everywhere while demanding Windows host execution
 * only where a real Windows SDK or compatible cross-toolchain exists.
 */
const publicRoot = path.resolve(__dirname, "..");
const portableTests = [
	["Merkava runtime manifest", ["scripts/awtsmoos/MerkavaExecutor/run-merkava-runtime-tests.js"]],
	["Tunnel shipped surface", ["tests/tunnel-surface.test.cjs"]],
	["Tunnel source integration", ["apps/tunnel/agent/tools/fs/testing/source-runtime-bulk-commandtree.test.cjs"]],
	["Merkava advanced runtime", ["scripts/awtsmoos/MerkavaExecutor/tests/merkava-runtime-advanced.test.cjs"]],
	["Merkava linked bundle", ["tests/merkava-bundle.test.cjs"]],
	["C++ compiler bridge", ["tests/cpp-compiler.test.mjs"]],
	["Merkava executor render stream", ["apps/merkava-native-browser/core/testExecutorRenderStreamContract.mjs"]],
	["C compiler import closure", ["../scripts/test/cCompilerImportClosure.test.mjs"]],
	["Assembler misc opcodes", ["../scripts/test/sshAssemblerMiscOpcodes.test.mjs"]]
];
const windowsTests = [
	["Merkava native browser seed", ["apps/merkava-native-browser/build-seed.mjs"]],
	["Native browser artifacts", ["tests/native-browser-artifacts.test.cjs"]],
	["Native browser runtime", ["apps/merkava-native-browser/test-native-runtime.mjs"]]
];
const toolchain = detectWindowsToolchain();
const tests = toolchain.available ? [...portableTests, ...windowsTests] : portableTests;
const skipped = toolchain.available ? [] : windowsTests.map(([name]) => ({
	name,
	reason: toolchain.reason
}));
let ok = true;
for (const [name, args] of tests) {
	const run = spawnSync(process.execPath, args, {
		cwd: publicRoot,
		stdio: "inherit",
		env: { ...process.env, NODE_NO_WARNINGS: "1" }
	});
	if (run.status !== 0) {
		ok = false;
		console.error(JSON.stringify({ ok: false, name, status: run.status }));
	}
}
if (!ok) process.exit(1);
console.log(JSON.stringify({
	ok: true,
	tests: tests.map(([name]) => name),
	skipped,
	windowsToolchain: toolchain
}, null, 2));
