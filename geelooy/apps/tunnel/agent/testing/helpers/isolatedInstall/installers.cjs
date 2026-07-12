// B"H
const assert = require('node:assert/strict');
const path = require('node:path');
const { spawn, spawnSync } = require('node:child_process');
const Paths = require('./paths.cjs');

/** B"H — Platform installers and every Unix helper are audited as one covenant. */
function assertInstallerScripts() {
	const windows = Paths.read(path.join(Paths.DOWNLOADS_ROOT, 'windows.ps1'));
	const unixFiles = [
		'unix.sh',
		'unix-install-core.sh',
		'unix-cleanup.sh',
		'unix-process-control.sh',
		'unix-supervisor.sh'
	];
	const unix = unixFiles.map(name => Paths.read(path.join(Paths.DOWNLOADS_ROOT, name))).join('\n');
	for (const token of ['AWTSMOOS_INSTALL_ROOT', 'AWTSMOOS_SKIP_START', 'Stop-OldAwtsAgent $root $entry']) {
		assert.equal(windows.includes(token), true, `windows installer missing: ${token}`);
	}
	for (const token of [
		'AWTSMOOS_INSTALL_ROOT',
		'AWTSMOOS_SKIP_START',
		'stop_existing_runtime',
		'wait_for_pids_to_exit',
		'is_protected_candidate'
	]) {
		assert.equal(unix.includes(token), true, `unix installer family missing: ${token}`);
	}
	assert.equal(windows.includes('Install-AwtsmoosFiles'), false);
	assert.equal(windows.includes('per-file install'), false);
	assert.equal(unix.includes('install_awtsmoos_files'), false);
	assert.equal(unix.includes('falling back to per-file'), false);
	for (const name of unixFiles) assertUnixSyntax(name);
}

function assertUnixSyntax(name) {
	const filePath = path.join(Paths.DOWNLOADS_ROOT, name);
	const result = spawnSync('bash', ['-n', filePath], { encoding: 'utf8' });
	if (!result.error) assert.equal(result.status, 0, result.stderr);
}

function installWithPlatform(options) {
	return hasPowerShell()
		? runInstaller('powershell', [
			'-NoProfile',
			'-ExecutionPolicy',
			'Bypass',
			'-File',
			path.join(Paths.DOWNLOADS_ROOT, 'windows.ps1')
		], options)
		: runInstaller('bash', [path.join(Paths.DOWNLOADS_ROOT, 'unix.sh')], options);
}

function runInstaller(command, args, options) {
	const child = spawn(command, args, { env: installerEnvironment(options) });
	return new Promise((resolve, reject) => {
		let stdout = '';
		let stderr = '';
		const timer = setTimeout(() => {
			child.kill('SIGKILL');
			reject(new Error(`installer timeout\n${stdout}${stderr}`));
		}, 120000);
		child.stdout.on('data', chunk => { stdout += chunk.toString(); });
		child.stderr.on('data', chunk => { stderr += chunk.toString(); });
		child.once('error', error => {
			clearTimeout(timer);
			reject(error);
		});
		child.once('exit', code => {
			clearTimeout(timer);
			try {
				assert.equal(code, 0, `${stdout}${stderr}`);
				assert.equal(stdout.includes('AWTSMOOS_SKIP_START set'), true);
				resolve(stdout);
			} catch (error) {
				reject(error);
			}
		});
	});
}

function installerEnvironment(options) {
	return {
		...process.env,
		AWTSMOOS_INSTALL_ORIGIN: options.origin,
		AWTSMOOS_INSTALL_ROOT: options.installRoot,
		AWTSMOOS_TUNNEL_NAME: 'awt-isolated-install-test',
		AWTSMOOS_RELAY: options.relay,
		AWTSMOOS_PROJECT_ROOT: options.projectRoot,
		AWTSMOOS_LOCAL_API_PORT: String(options.localApiPort),
		AWTSMOOS_SKIP_START: '1',
		AWTSMOOS_SKIP_OPEN_CONTROL: '1'
	};
}

function hasPowerShell() {
	const result = spawnSync('powershell', [
		'-NoProfile',
		'-Command',
		'$PSVersionTable.PSVersion.ToString()'
	], { encoding: 'utf8' });
	return !result.error && result.status === 0;
}

module.exports = { assertInstallerScripts, installWithPlatform };
