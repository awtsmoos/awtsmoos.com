// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Proves concurrent deploy callers collapse onto one activation.
 * @description The Awtsmoos may hear three knocks at once; Awtsmoos.com answers through one gate and records one restart in place.
 */
import assert from 'node:assert/strict';
import { chmod, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

const coordinator = new URL('./deploymentCoordinator.mjs', import.meta.url).pathname;
const requested = ['a'.repeat(40), 'b'.repeat(40), 'c'.repeat(40)];
const newest = requested[2];

test('three concurrent callers produce one activation and two no-ops', async () => {
	const root = await mkdtemp(path.join(os.tmpdir(), 'awtsmoos-deploy-coordinator-'));
	const worker = path.join(root, 'worker.sh');
	const activations = path.join(root, 'activations.txt');
	const deployed = path.join(root, 'deployed.txt');
	await writeFile(worker, workerSource());
	await chmod(worker, 0o755);
	const env = testEnvironment(root, activations, deployed);
	const results = await Promise.all(requested.map(sha => runCoordinator(sha, worker, env)));
	assert.deepEqual(results.map(result => result.code), [0, 0, 0]);
	const lines = (await readFile(activations, 'utf8')).trim().split('\n').filter(Boolean);
	assert.deepEqual(lines, [newest]);
	assert.equal(results.filter(result => result.stdout.includes('CANONICAL_DEPLOY_OK')).length, 1);
	assert.equal(results.filter(result => result.stdout.includes('CANONICAL_DEPLOY_NOOP')).length, 2);
	const state = JSON.parse(await readFile(path.join(env.AWTSMOOS_DEPLOY_STATE_ROOT, 'state.json'), 'utf8'));
	assert.equal(state.status, 'complete');
	assert.equal(state.deployedSha, newest);
});

function testEnvironment(root, activations, deployed) {
	return {
		...process.env,
		AWTSMOOS_DEPLOY_STATE_ROOT: path.join(root, 'state'),
		AWTSMOOS_DEPLOY_COALESCE_MS: '20',
		AWTSMOOS_TEST_REMOTE_SHA: newest,
		AWTSMOOS_TEST_ACTIVATIONS: activations,
		AWTSMOOS_TEST_DEPLOYED: deployed
	};
}

function runCoordinator(sha, worker, env) {
	return new Promise((resolve, reject) => {
		const child = spawn(process.execPath, [coordinator, sha, worker], { env });
		let stdout = '';
		let stderr = '';
		child.stdout.on('data', chunk => { stdout += chunk; });
		child.stderr.on('data', chunk => { stderr += chunk; });
		child.once('error', reject);
		child.once('close', code => resolve({ code, stdout, stderr }));
	});
}

function workerSource() {
	return `#!/usr/bin/env bash\nset -eu\nremote="$AWTSMOOS_TEST_REMOTE_SHA"\ncurrent=""\nif [ -f "$AWTSMOOS_TEST_DEPLOYED" ]; then current="$(cat "$AWTSMOOS_TEST_DEPLOYED")"; fi\nif [ "$current" = "$remote" ]; then printf 'B"H CANONICAL_DEPLOY_NOOP sha=%s\\n' "$remote"; exit 0; fi\nprintf '%s\\n' "$remote" > "$AWTSMOOS_TEST_DEPLOYED"\nprintf '%s\\n' "$remote" >> "$AWTSMOOS_TEST_ACTIVATIONS"\nprintf 'B"H CANONICAL_DEPLOY_OK sha=%s\\n' "$remote"\n`;
}
