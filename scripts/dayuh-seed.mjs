#!/usr/bin/env node
// B"H
import { existsSync } from 'node:fs';
import { dayuhSyncConfig } from './lib/dayuhSyncConfig.mjs';
import { seedDayuhRemote } from './lib/dayuhRemoteSeed.mjs';
import { loadPassword } from './lib/safeSshPasswordStore.mjs';

const config = dayuhSyncConfig();

async function main() {
	if (!existsSync(config.localRoot)) throw new Error(`local_root_missing: ${config.localRoot}`);
	const password = loadPassword();
	if (!password) throw new Error('stored_ssh_password_missing');
	const startedAt = Date.now();
	const summary = await seedDayuhRemote(config, password, event => {
		console.log(JSON.stringify({ phase: 'seed-stream', ...event }));
	});
	console.log(JSON.stringify({
		BH: 'B"H',
		phase: 'seed-complete',
		remoteRoot: config.remoteRoot,
		bytes: summary.bytes,
		sha256: summary.sha256,
		elapsedMs: Date.now() - startedAt
	}, null, 2));
}

main().catch(error => {
	console.error(`B"H dayuh seed failed: ${error.message}`);
	process.exitCode = 1;
});
