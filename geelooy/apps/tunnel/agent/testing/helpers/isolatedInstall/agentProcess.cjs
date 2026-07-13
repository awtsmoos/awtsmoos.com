// B"H
const { spawn } = require('node:child_process');
const path = require('node:path');

/** B"H — Early death, graceful shutdown, and forced cleanup share one receipt. */
function start(options) {
	const child = spawn(process.execPath, [path.join(options.installRoot, 'main.js')], {
		cwd: options.projectRoot,
		stdio: ['ignore', 'pipe', 'pipe'],
		env: {
			...process.env,
			USERPROFILE: options.tempHome,
			HOME: options.tempHome,
			AWTSMOOS_MAX_INFLIGHT: '4',
			AWTSMOOS_MAX_QUEUE: '80',
			AWTSMOOS_SKIP_OPEN_CONTROL: '1',
			AWTSMOOS_SELF_UPDATE_DISABLED: '1',
			AWTSMOOS_COMMAND_MAX_ACTIVE: '1'
		}
	});
	let stdout = '';
	let stderr = '';
	child.stdout.on('data', chunk => { stdout += chunk.toString(); });
	child.stderr.on('data', chunk => { stderr += chunk.toString(); });
	const exited = new Promise(resolve => {
		child.once('exit', (code, signal) => resolve({ code, signal }));
	});
	return {
		child,
		exited,
		output: () => ({ stdout, stderr })
	};
}

function waitForRegistration(processRecord, relay) {
	return Promise.race([
		relay.waitFor(message => message.type === 'TUNNEL_REGISTER', 15000),
		processRecord.exited.then(result => {
			const logs = processRecord.output();
			throw new Error(`installed agent exited before registration: ${JSON.stringify(result)}\n${logs.stdout}\n${logs.stderr}`);
		})
	]);
}

async function stop(processRecord) {
	const { child, exited } = processRecord;
	if (child.exitCode !== null || child.signalCode !== null) return exited;
	child.kill('SIGTERM');
	const graceful = await Promise.race([
		exited.then(result => ({ done: true, result })),
		sleep(3000).then(() => ({ done: false }))
	]);
	if (graceful.done) return graceful.result;
	child.kill('SIGKILL');
	return Promise.race([
		exited,
		sleep(3000).then(() => ({ code: null, signal: 'unconfirmed' }))
	]);
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { start, stop, waitForRegistration };
