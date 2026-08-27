// B"H
const childProcess = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

/** B"H — Extraction and restart are explicit child-process receipts. */
async function extractZip(zipPath, root) {
	if (await commandExists('unzip')) {
		return run('unzip', ['-o', zipPath, '-d', root]);
	}
	if (await commandExists('python3')) {
		return run('python3', ['-m', 'zipfile', '-e', zipPath, root]);
	}
	if (process.platform === 'win32') {
		return run('powershell', [
			'-NoProfile',
			'-Command',
			`Expand-Archive -Force -Path ${JSON.stringify(zipPath)} -DestinationPath ${JSON.stringify(root)}`
		]);
	}
	throw new Error('no_zip_extractor');
}

function assertZip(filePath) {
	const descriptor = fs.openSync(filePath, 'r');
	const buffer = Buffer.alloc(4);
	try { fs.readSync(descriptor, buffer, 0, 4, 0); }
	finally { fs.closeSync(descriptor); }
	if (buffer.toString('hex') !== '504b0304') throw new Error('bundle_not_zip');
}

function commandExists(name) {
	return new Promise(resolve => {
		const checker = process.platform === 'win32' ? 'where' : 'command';
		const args = process.platform === 'win32' ? [name] : ['-v', name];
		const child = childProcess.spawn(checker, args, {
			stdio: 'ignore',
			shell: process.platform !== 'win32',
			windowsHide: true
		});
		child.on('error', () => resolve(false));
		child.on('close', code => resolve(code === 0));
	});
}

function run(file, args) {
	return new Promise((resolve, reject) => {
		const child = childProcess.spawn(file, args, {
			stdio: 'ignore',
			windowsHide: true
		});
		child.on('error', reject);
		child.on('close', code => {
			if (code === 0) resolve({ ok: true, file, args });
			else reject(new Error(`${file}_exit_${code}`));
		});
	});
}

function restartIntoUpdatedAgent(root, extraArgs = process.argv.slice(2)) {
	const entry = path.join(root, 'main.js');
	const child = childProcess.spawn(process.execPath, [entry, ...extraArgs], {
		cwd: root,
		detached: true,
		stdio: 'ignore',
		windowsHide: true
	});
	child.unref();
	return { ok: true, pid: child.pid, entry };
}

function safeName(value = 'bundle') {
	return String(value).replace(/[^a-zA-Z0-9_.-]/g, '_') || 'bundle';
}

module.exports = {
	assertZip,
	commandExists,
	extractZip,
	restartIntoUpdatedAgent,
	run,
	safeName
};
