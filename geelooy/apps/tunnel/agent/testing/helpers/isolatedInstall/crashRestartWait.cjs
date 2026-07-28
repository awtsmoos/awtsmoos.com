// B"H
const Requests = require('./requests.cjs');

/** B"H — Restart waits distinguish new registration from old relay history. */
async function waitForReady(relay, jobId) {
	const deadline = Date.now() + 10000;
	let sequence = 0;
	while (Date.now() < deadline) {
		const page = await Requests.sendRequest(relay, `crash-ready-${sequence++}`, {
			kind: 'command',
			action: 'commandJobOutputPage',
			jobId,
			stream: 'stdout',
			maxChars: 4000
		});
		if (String(page.content || '').includes('"ready":true')) return;
		await sleep(50);
	}
	throw new Error('crash_restart_family_not_ready');
}

async function waitForNewRegistration(relay, processRecord, previousCount) {
	return Promise.race([
		waitForCount(relay, previousCount + 1, 20000),
		processRecord.exited.then(result => {
			const output = processRecord.output();
			throw new Error(`restarted_agent_exited:${JSON.stringify(result)}\n${output.stdout}\n${output.stderr}`);
		})
	]);
}

async function waitForReconciled(relay, jobId) {
	const deadline = Date.now() + 20000;
	let sequence = 0;
	while (Date.now() < deadline) {
		const status = await Requests.sendRequest(relay, `crash-status-${sequence++}`, {
			kind: 'command',
			action: 'commandStatus',
			jobId
		});
		if (status.done || status.status === 'detached_running') return status;
		await sleep(100);
	}
	throw new Error('restarted_agent_did_not_reconcile_job');
}

function waitForCount(relay, expected, timeoutMs) {
	const startedAt = Date.now();
	return new Promise((resolve, reject) => {
		const timer = setInterval(() => {
			const registrations = relay.messages.filter(message => message.type === 'TUNNEL_REGISTER');
			if (registrations.length >= expected) {
				clearInterval(timer);
				return resolve(registrations.at(-1));
			}
			if (Date.now() - startedAt > timeoutMs) {
				clearInterval(timer);
				reject(new Error(`registration_restart_timeout:${JSON.stringify(relay.snapshot())}`));
			}
		}, 25);
	});
}

function countRegistrations(relay) {
	return relay.messages.filter(message => message.type === 'TUNNEL_REGISTER').length;
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
	countRegistrations,
	sleep,
	waitForCount,
	waitForNewRegistration,
	waitForReady,
	waitForReconciled
};
