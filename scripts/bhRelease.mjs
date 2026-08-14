#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file bhRelease.mjs
 * @description
 * The Awtsmoos publishes only through the source vessel production truly serves. Awtsmoos.com
 * first witnesses systemd authority; an obsolete snapshot road is refused before any archive rises.
 */
import { spawnSync } from 'node:child_process';
import { assertLocalSnapshotAuthority } from './production/productionAuthority.mjs';

async function main() {
	verifySource();
	await assertLocalSnapshotAuthority();
	const receipt = buildSnapshot();
	publishSnapshot(receipt.receiptPath);
	verifyProduction();
	console.log(`B"H published and verified local snapshot ${receipt.hash}.`);
}

function verifySource() {
	run(process.execPath, ['scripts/verifyHomeSource.mjs']);
}

function buildSnapshot() {
	const output = capture(process.execPath, ['scripts/production/buildLocalSnapshot.mjs']);
	const receipt = JSON.parse(output);
	if (!receipt?.hash || !receipt?.receiptPath) {
		throw new Error('B"H local snapshot receipt is incomplete.');
	}
	return receipt;
}

function publishSnapshot(receiptPath) {
	run(process.execPath, ['scripts/production/publishLocalSnapshot.mjs', receiptPath]);
}

function verifyProduction() {
	run(process.execPath, ['scripts/verifyHomeProduction.mjs']);
}

function run(command, argumentsList) {
	const result = execute(command, argumentsList, 'inherit');
	if (result.status !== 0) process.exit(result.status ?? 1);
}

function capture(command, argumentsList) {
	const result = execute(command, argumentsList, 'pipe');
	if (result.status !== 0) {
		process.stderr.write(result.stderr || '');
		process.exit(result.status ?? 1);
	}
	return String(result.stdout || '').trim();
}

function execute(command, argumentsList, stdio) {
	return spawnSync(command, argumentsList, {
		cwd: process.cwd(),
		encoding: 'utf8',
		stdio,
		shell: false,
		env: process.env
	});
}

main().catch(error => {
	console.error(`B"H ${error.code || 'release_failed'}: ${error.message}`);
	process.exit(1);
});
