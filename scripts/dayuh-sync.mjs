#!/usr/bin/env node
// B"H
import { existsSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import { dayuhSyncConfig } from './lib/dayuhSyncConfig.mjs';
import { buildManifest, hashFile, readManifest, writeManifest } from './lib/dayuhManifest.mjs';
import { planPull, planPush, planSync } from './lib/dayuhPlan.mjs';
import { openDayuhRemote } from './lib/dayuhRemoteSession.mjs';
import { transferPool } from './lib/dayuhTransferPool.mjs';
import { loadPassword } from './lib/safeSshPasswordStore.mjs';

const config = dayuhSyncConfig();
const cacheFile = join(config.localState, 'current.json');
const baseFile = join(config.localState, 'base.json');
const helperFile = new URL('./remote/dayuhRemoteManifest.mjs', import.meta.url).pathname;

async function main() {
	if (!existsSync(config.localRoot)) throw new Error(`local_root_missing: ${config.localRoot}`);
	const password = loadPassword();
	if (!password) throw new Error('stored_ssh_password_missing');
	const local = await buildManifest(config.localRoot, cacheFile, manifestProgress);
	const remote = await openDayuhRemote(config, password);
	try {
		await remote.initialize(helperFile);
		await remote.lock(config.force);
		try { await runAction(remote, local, await remote.scan()); }
		finally { await remote.unlock(); }
	} finally {
		remote.close();
	}
}

async function runAction(remote, local, remoteManifest) {
	if (config.action === 'status') return reportStatus(local, remoteManifest);
	if (config.action === 'push') return push(remote, local, remoteManifest);
	if (config.action === 'pull') return pull(remote, local, remoteManifest);
	if (config.action === 'sync') return synchronize(remote, local, remoteManifest);
	throw new Error(`unknown_action: ${config.action}`);
}

async function push(remote, local, remoteManifest) {
	const plan = planPush(local, remoteManifest, config.deleteMissing);
	reportPlan('push', plan);
	if (config.dryRun) return;
	await transferPool(plan.upload, 4, path => remote.upload(config.localRoot, path, local.files[path]), transferProgress);
	await transferPool(plan.removeRemote, 4, path => remote.removeRemote(path), transferProgress);
	const verified = await remote.scan();
	verifyPaths(local, verified, plan.upload);
	await writeManifest(baseFile, verified);
}

async function pull(remote, local, remoteManifest) {
	const plan = planPull(local, remoteManifest, config.deleteMissing);
	reportPlan('pull', plan);
	if (config.dryRun) return;
	await transferPool(plan.download, 4, async path => {
		await remote.download(config.localRoot, path, remoteManifest.files[path]);
		await verifyLocal(path, remoteManifest.files[path]);
		return remoteManifest.files[path].size;
	}, transferProgress);
	for (const path of plan.removeLocal) await rm(join(config.localRoot, path), { force: true });
	await writeManifest(baseFile, remoteManifest);
}

async function synchronize(remote, local, remoteManifest) {
	const plan = planSync(await readManifest(baseFile), local, remoteManifest);
	reportPlan('sync', plan);
	if (config.dryRun) return;
	for (const path of plan.conflicts) console.error(JSON.stringify({ phase: 'conflict', path, preserved: await remote.preserveConflict(config.localRoot, path) }));
	if (plan.conflicts.length) throw new Error(`sync_conflicts: ${plan.conflicts.length}`);
	await transferPool(plan.upload, 4, path => remote.upload(config.localRoot, path, local.files[path]), transferProgress);
	await transferPool(plan.download, 4, path => remote.download(config.localRoot, path, remoteManifest.files[path]), transferProgress);
	await writeManifest(baseFile, await remote.scan());
}

function reportStatus(local, remote) { console.log(JSON.stringify({ localFiles: count(local), remoteFiles: count(remote), push: planPush(local, remote), pull: planPull(local, remote) }, null, 2)); }
function reportPlan(action, plan) { console.log(JSON.stringify({ action, counts: Object.fromEntries(Object.entries(plan).map(([key, rows]) => [key, rows.length])) }, null, 2)); }
function count(manifest) { return Object.keys(manifest.files || {}).length; }
function manifestProgress(event) { if (event.files % 500 === 0) console.log(JSON.stringify(event)); }
function transferProgress(event) { console.log(JSON.stringify({ phase: 'transfer', ...event })); }
function verifyPaths(local, remote, paths) { for (const path of paths) if (local.files[path].sha256 !== remote.files?.[path]?.sha256) throw new Error(`remote_verify_failed: ${path}`); }
async function verifyLocal(path, entry) { if (await hashFile(join(config.localRoot, path)) !== entry.sha256) throw new Error(`local_verify_failed: ${path}`); }

main().catch(error => {
	console.error(`B"H dayuh sync failed: ${error.message}`);
	process.exitCode = 1;
});
