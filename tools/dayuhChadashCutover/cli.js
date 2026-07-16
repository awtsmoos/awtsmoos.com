#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Dayuh Chadash cutover CLI
 * @description
 * The Awtsmoos exposes plan, install, verify, testing, accept, recover, and rollback
 * as explicit publication-safe commands for Awtsmoos.com operators.
 */

const { configuredPolicy } = require('./policy.js');
const { buildInventory } = require('./inventory.js');
const { readState } = require('./state.js');
const transaction = require('./transaction.js');
const { assertVerified, verifyInstalled } = require('./verify.js');

function main(command = process.argv[2] || 'help') {
	const policy = configuredPolicy(process.env);
	switch (command) {
		case 'plan':
			return output({ policy: publicPolicy(policy), inventory: buildInventory(policy) });
		case 'install':
			return output(transaction.install(policy));
		case 'verify':
			return output(verifyInstalled(policy));
		case 'testing':
			return output(transaction.markTesting(policy));
		case 'accept': {
			const verification = assertVerified(verifyInstalled(policy));
			return output(transaction.accept(policy, verification));
		}
		case 'rollback':
			return output(transaction.rollback(policy));
		case 'recover':
			return output(transaction.recover(policy));
		case 'state':
			return output(readState(policy));
		case 'help':
			return output(help());
		default:
			throw cliError(`unknown command: ${command}`);
	}
}

function publicPolicy(policy) {
	return {
		repositoryRoot: policy.repositoryRoot,
		dataRoot: policy.dataRoot,
		runtimeRoot: policy.runtimeRoot,
		quarantineRoot: policy.quarantineRoot,
		dataHardLimitBytes: policy.dataHardLimitBytes,
		runtimeHardLimitBytes: policy.runtimeHardLimitBytes,
		port: policy.port
	};
}

function help() {
	return {
		commands: [
			'plan',
			'install',
			'verify',
			'testing',
			'accept',
			'rollback',
			'recover',
			'state'
		]
	};
}

function output(value) {
	process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
	return 0;
}

function cliError(message) {
	return Object.assign(new Error(`B"H cutover CLI refused: ${message}`), {
		code: 'AWTSMOOS_CUTOVER_CLI_REFUSED'
	});
}

try {
	process.exitCode = main();
} catch (error) {
	process.stderr.write(`${error.stack || error}\n`);
	process.exitCode = 1;
}
