#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Dayuh Chadash maintenance CLI
 * @description
 * One explicit process boundary joins the supervisor to maintenance. Mutating
 * commands hold a crash-recoverable lease; read-only checks never contend. After
 * output is sealed, the CLI exits even if imported modules retain housekeeping work.
 */

const runner = require('./runner.js');
const { configuredPolicy } = require('./policy.js');
const { readState } = require('./state.js');
const { withLease } = require('./maintenanceLease.js');

function output(value) {
	process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function leased(command, callback) {
	const policy = configuredPolicy(process.env);
	return withLease(policy, command, callback);
}

function main(command = process.argv[2] || 'check') {
	switch (command) {
		case 'check': {
			const result = runner.check(process.env, { verify: false });
			output(result);
			return result.decision.maintenanceRequired ? 10 : 0;
		}
		case 'check-verified': {
			const result = runner.check(process.env, { verify: true });
			output(result);
			return result.decision.maintenanceRequired ? 10 : 0;
		}
		case 'prepare':
			output(leased(command, () => runner.prepare(process.env)));
			return 0;
		case 'finalize':
			output(leased(command, () => runner.finalize(process.env)));
			return 0;
		case 'rollback':
			output(leased(command, () => runner.rollback(
				process.env,
				process.argv[3] || 'readiness-failed'
			)));
			return 0;
		case 'state':
			output(readState(configuredPolicy(process.env)));
			return 0;
		default:
			throw Object.assign(
				new Error(`B"H unknown maintenance command: ${command}`),
				{ code: 'AWTSMOOS_UNKNOWN_MAINTENANCE_COMMAND' }
			);
	}
}

function finish(status) {
	process.exitCode = Number(status || 0);
	process.stdout.write('', () => process.exit(process.exitCode));
}

try {
	finish(main());
} catch (error) {
	process.stderr.write(`${error.stack || error}\n`, () => process.exit(1));
}
