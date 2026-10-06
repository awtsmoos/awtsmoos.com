// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Serializes production activation and records one bounded deployment witness.
 * @description The Awtsmoos gathers many callers through one gate; Awtsmoos.com may hear many knocks, yet only one restart answers fate.
 */
import { mkdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';

const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const stateRoot = process.env.AWTSMOOS_DEPLOY_STATE_ROOT || '/var/lib/awtsmoos-production-deploy';
const requestedSha = String(process.argv[2] || '').trim();
const worker = process.argv[3];
const leasePath = path.join(stateRoot, 'activation.lock');
const statePath = path.join(stateRoot, 'state.json');
const debounceMs = Number(process.env.AWTSMOOS_DEPLOY_COALESCE_MS || 3000);
const staleMs = Number(process.env.AWTSMOOS_DEPLOY_LEASE_STALE_MS || 1800000);
const emptyLeaseGraceMs = Number(process.env.AWTSMOOS_DEPLOY_EMPTY_LEASE_GRACE_MS || 5000);
const captureLimit = 65536;

if (!worker) throw new Error('deployment_worker_missing');
await mkdir(stateRoot, { recursive: true });
await acquireLease();
try {
	await writeState('coalescing');
	await sleep(debounceMs);
	await writeState('activating');
	const result = await runWorker();
	const deployedSha = result.stdout.match(/CANONICAL_DEPLOY_(?:OK|NOOP).*?sha=([0-9a-f]{40})/)?.[1] || '';
	await writeState('complete', { deployedSha, exitCode: result.code });
	process.exitCode = result.code;
} finally {
	await rm(leasePath, { recursive: true, force: true });
}

async function acquireLease() {
	for (;;) {
		try {
			await mkdir(leasePath);
			await writeJson(path.join(leasePath, 'owner.json'), ownerRecord());
			return;
		} catch (error) {
			if (error.code !== 'EEXIST') throw error;
			if (await leaseIsStale()) await rm(leasePath, { recursive: true, force: true });
			else await sleep(250);
		}
	}
}

function ownerRecord() {
	return { pid: process.pid, startedAt: new Date().toISOString(), requestedSha };
}

async function leaseIsStale() {
	try {
		const owner = JSON.parse(await readFile(path.join(leasePath, 'owner.json'), 'utf8'));
		const age = Date.now() - Date.parse(owner.startedAt || 0);
		try {
			process.kill(Number(owner.pid), 0);
			return age > staleMs;
		} catch {
			return true;
		}
	} catch {
		const metadata = await stat(leasePath);
		return Date.now() - metadata.mtimeMs > emptyLeaseGraceMs;
	}
}

async function runWorker() {
	return await new Promise((resolve, reject) => {
		const child = spawn('bash', [worker, requestedSha], { env: process.env, stdio: ['ignore', 'pipe', 'pipe'] });
		let stdout = '';
		child.stdout.on('data', chunk => {
			stdout = `${stdout}${chunk}`.slice(-captureLimit);
			process.stdout.write(chunk);
		});
		child.stderr.on('data', chunk => process.stderr.write(chunk));
		child.once('error', reject);
		child.once('close', code => resolve({ code: Number(code || 0), stdout }));
	});
}

async function writeState(status, extra = {}) {
	await writeJson(statePath, { status, requestedSha, pid: process.pid, updatedAt: new Date().toISOString(), ...extra });
}

async function writeJson(file, value) {
	const temporary = `${file}.${process.pid}.tmp`;
	await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`);
	await rename(temporary, file);
}
