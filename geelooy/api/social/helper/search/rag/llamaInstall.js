// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LlamaExplicitInstaller
 * @description
 * Installation commands remain isolated from ordinary search. This module is reached
 * only when a caller explicitly authorizes local runner setup.
 */

const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

function isWindows() {
	return process.platform === 'win32';
}

function commands(root) {
	const laboratory = path.join(root, 'embedder-lab');
	const source = path.join(laboratory, 'llama.cpp');
	const build = path.join(source, 'build');
	if (isWindows()) {
		return [
			`New-Item -ItemType Directory -Force ${JSON.stringify(laboratory)}`,
			`git clone https://github.com/ggerganov/llama.cpp ${JSON.stringify(source)}`,
			`cmake -S ${JSON.stringify(source)} -B ${JSON.stringify(build)} -DLLAMA_BUILD_TESTS=OFF`,
			`cmake --build ${JSON.stringify(build)} --config Release --target llama-embedding`
		];
	}
	return [
		`mkdir -p ${JSON.stringify(laboratory)}`,
		`git clone https://github.com/ggerganov/llama.cpp ${JSON.stringify(source)}`,
		`cmake -S ${JSON.stringify(source)} -B ${JSON.stringify(build)} -DLLAMA_BUILD_TESTS=OFF`,
		`cmake --build ${JSON.stringify(build)} --target llama-embedding -j2`
	];
}

function runInstall(root) {
	const shell = isWindows() ? 'powershell.exe' : 'bash';
	const flag = isWindows() ? '-Command' : '-lc';
	const output = [];
	for (const command of commands(root)) {
		const existing = command.includes('git clone')
			&& fs.existsSync(path.join(root, 'embedder-lab', 'llama.cpp'));
		if (existing) continue;
		const result = childProcess.spawnSync(shell, [flag, command], {
			encoding: 'utf8',
			shell: false,
			maxBuffer: 8 * 1024 * 1024
		});
		output.push({
			command,
			status: result.status,
			stderr: result.stderr?.slice(-2000),
			stdout: result.stdout?.slice(-2000)
		});
		if (result.status) break;
	}
	return output;
}

module.exports = {
	commands,
	runInstall
};
