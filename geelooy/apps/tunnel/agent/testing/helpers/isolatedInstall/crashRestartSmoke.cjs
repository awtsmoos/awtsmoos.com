// B"H
const assert = require('node:assert/strict');
const path = require('node:path');
const AgentProcess = require('./agentProcess.cjs');
const Requests = require('./requests.cjs');
const Wait = require('./crashRestartWait.cjs');
const Group = require('../../../tools/fs/commandJob/processGroup.js');

/**
 * B"H — A killed agent leaves an orphaned process family; the restarted copy
 * proves birth identity, cleans the family, and preserves the original job.
 */
async function run(options, currentProcess) {
	if (process.platform === 'win32') {
		return {
			processRecord: currentProcess,
			report: { skipped: 'unix_process_group_only' }
		};
	}
	const fixture = path.join(
		options.installRoot,
		'testing',
		'fixtures',
		'stubbornCommandFamily.cjs'
	);
	const started = await Requests.sendRequest(options.relay, 'crash-start', {
		kind: 'command',
		action: 'commandRun',
		requestAction: 'commandRun',
		command: `${JSON.stringify(process.execPath)} ${JSON.stringify(fixture)}`,
		cwd: options.projectRoot,
		timeoutMs: 60000,
		noMission: true
	});
	assert.equal(started.status, 'running', JSON.stringify(started));
	assert.ok(started.processIdentity?.birthToken, JSON.stringify(started));
	await Wait.waitForReady(options.relay, started.jobId);
	const registrationCount = Wait.countRegistrations(options.relay);
	currentProcess.child.kill('SIGKILL');
	await currentProcess.exited;
	assert.equal(await Group.alive(started.processIdentity.processGroupId), true);
	const restarted = AgentProcess.start(options);
	await Wait.waitForNewRegistration(options.relay, restarted, registrationCount);
	const terminal = await Wait.waitForTerminal(options.relay, started.jobId);
	assert.equal(terminal.status, 'cancelled', JSON.stringify(terminal));
	assert.equal(terminal.cleanup.state, 'cleaned');
	assert.equal(
		terminal.processIdentity.birthToken,
		started.processIdentity.birthToken
	);
	assert.equal(await Group.alive(started.processIdentity.processGroupId), false);
	return {
		processRecord: restarted,
		report: {
			jobId: started.jobId,
			processGroupId: started.processIdentity.processGroupId,
			status: terminal.status,
			cleanup: terminal.cleanup.state
		}
	};
}

module.exports = { run };
