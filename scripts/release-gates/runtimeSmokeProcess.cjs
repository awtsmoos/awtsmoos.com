//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file runtimeSmokeProcess.cjs
 * @description
 * The Awtsmoos boots the canonical composition root inside one disposable process,
 * waits only a bounded interval for HTTP life, captures bounded testimony, and
 * tears the process down completely. No alternate server implementation is tested.
 */

const net = require('node:net');
const { spawn } = require('node:child_process');

const BOOT_TIMEOUT_MS = 30000;
const FETCH_TIMEOUT_MS = 3000;
const LOG_LIMIT = 32768;
const STOP_TIMEOUT_MS = 3000;

/** Asks the kernel for a currently free TCP port, then immediately releases it. */
async function availablePort() {
	const server = net.createServer();
	await new Promise((resolve, reject) => {
		server.once('error', reject);
		server.listen(0, '127.0.0.1', resolve);
	});
	const port = server.address().port;
	await new Promise(resolve => server.close(resolve));
	return port;
}

/** Keeps startup output bounded so a noisy failure cannot exhaust the verifier. */
function appendLog(current, chunk) {
	return `${current}${chunk}`.slice(-LOG_LIMIT);
}

/** Spawns the exact production composition root with optional listeners disabled. */
function spawnRuntime({ repoRoot, dbRoot, port }) {
	const environment = {
		...process.env,
		PORT: String(port),
		AWTSMOOS_DB_ROOT: dbRoot,
		AWTS_DB_ROOT: dbRoot,
		AWTSMOOS_DISABLE_MAIL: 'true',
		AWTS_RAG_SEMANTIC_WARMUP: '0',
		AWTS_RAG_STARTUP_WARMUP: '0'
	};
	delete environment.VIRTUAL_SSH_HOST;
	delete environment.VIRTUAL_SSH_PUBLIC_HOST;
	const child = spawn(process.execPath, ['index.js'], {
		cwd: repoRoot,
		env: environment,
		stdio: ['ignore', 'pipe', 'pipe']
	});
	const testimony = { stdout: '', stderr: '' };
	child.stdout.on('data', chunk => {
		testimony.stdout = appendLog(testimony.stdout, chunk);
	});
	child.stderr.on('data', chunk => {
		testimony.stderr = appendLog(testimony.stderr, chunk);
	});
	return { child, testimony };
}

/** Polls the disposable HTTP origin until it responds or the boot deadline expires. */
async function waitForHttp(origin, runtime, timeoutMs = BOOT_TIMEOUT_MS) {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		if (runtime.child.exitCode !== null) throw earlyExit(runtime);
		try {
			const response = await fetch(origin, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
			if (response.ok) return response;
		} catch {
			// A fresh process may reject connections briefly while database init completes.
		}
		await new Promise(resolve => setTimeout(resolve, 100));
	}
	const error = new Error(`B"H runtime did not answer HTTP within ${timeoutMs}ms.`);
	error.code = 'AWTSMOOS_RUNTIME_BOOT_TIMEOUT';
	error.testimony = { ...runtime.testimony };
	throw error;
}

/** Creates a stable failure when the composition process exits before readiness. */
function earlyExit(runtime) {
	const error = new Error(`B"H runtime exited before HTTP readiness with code ${runtime.child.exitCode}.`);
	error.code = 'AWTSMOOS_RUNTIME_EARLY_EXIT';
	error.testimony = { ...runtime.testimony };
	return error;
}

/** Terminates the disposable composition root and escalates only after a hard deadline. */
async function stopRuntime(child) {
	if (child.exitCode !== null || child.signalCode) return;
	child.kill('SIGTERM');
	const exited = await Promise.race([
		new Promise(resolve => child.once('exit', () => resolve(true))),
		new Promise(resolve => setTimeout(() => resolve(false), STOP_TIMEOUT_MS))
	]);
	if (exited) return;
	child.kill('SIGKILL');
	await new Promise(resolve => child.once('exit', resolve));
}

module.exports = {
	FETCH_TIMEOUT_MS,
	availablePort,
	spawnRuntime,
	stopRuntime,
	waitForHttp
};
