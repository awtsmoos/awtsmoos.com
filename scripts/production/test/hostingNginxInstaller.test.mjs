// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos proves production ingress installation as a complete-file transaction:
 * success replaces whole vessels, while failed Nginx validation resurrects every old
 * witness exactly and leaves no half-born tenant configuration behind.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(here, '../../..');
const installer = path.join(repositoryRoot, 'scripts/production/install-hosting-nginx.sh');

function sandbox(t, failValidation = false) {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-nginx-install-'));
	t.after(() => fs.rmSync(root, { recursive: true, force: true }));
	const enabled = path.join(root, 'enabled');
	const bin = path.join(root, 'bin');
	fs.mkdirSync(enabled, { recursive: true });
	fs.mkdirSync(bin, { recursive: true });
	fs.writeFileSync(path.join(enabled, 'awtsmoos.com'), 'OLD_PLATFORM\n');
	fs.writeFileSync(path.join(enabled, 'default'), 'OLD_DEFAULT\n');
	writeExecutable(path.join(bin, 'nginx'), fakeNginxScript());
	writeExecutable(path.join(bin, 'systemctl'), '#!/bin/sh\nexit 0\n');
	return {
		root,
		enabled,
		environment: {
			...process.env,
			PATH: `${bin}:${process.env.PATH}`,
			AWTSMOOS_PRODUCTION_REPO: repositoryRoot,
			AWTSMOOS_NGINX_ENABLED_DIR: enabled,
			AWTSMOOS_NGINX_SKIP_RELOAD: '1',
			AWTSMOOS_FAKE_NGINX_FAIL: failValidation ? '1' : '0'
		}
	};
}

function runInstaller(vessel) {
	return spawnSync('bash', [installer], {
		cwd: repositoryRoot,
		env: vessel.environment,
		encoding: 'utf8'
	});
}

function writeExecutable(destination, content) {
	fs.writeFileSync(destination, content, { mode: 0o755 });
}

function fakeNginxScript() {
	return `#!/bin/sh
if [ "$AWTSMOOS_FAKE_NGINX_FAIL" = "1" ]; then
	echo "fake nginx validation rupture" >&2
	exit 1
fi
exit 0
`;
}

test('successful install replaces complete platform/default state with rendered hosting vessels', t => {
	const vessel = sandbox(t);
	const result = runInstaller(vessel);
	assert.equal(result.status, 0, result.stderr);
	const platform = fs.readFileSync(path.join(vessel.enabled, 'awtsmoos.com'), 'utf8');
	const tenant = fs.readFileSync(path.join(vessel.enabled, 'awtsmoos-custom-domains-http'), 'utf8');
	assert.match(platform, /server_name awtsmoos\.com www\.awtsmoos\.com;/);
	assert.doesNotMatch(platform, /api\/social\/drive\/public/);
	assert.match(tenant, /listen 80 default_server;/);
	assert.equal(fs.existsSync(path.join(vessel.enabled, 'default')), false);
});

test('failed nginx validation restores old platform and default with no tenant residue', t => {
	const vessel = sandbox(t, true);
	const result = runInstaller(vessel);
	assert.notEqual(result.status, 0);
	assert.equal(fs.readFileSync(path.join(vessel.enabled, 'awtsmoos.com'), 'utf8'), 'OLD_PLATFORM\n');
	assert.equal(fs.readFileSync(path.join(vessel.enabled, 'default'), 'utf8'), 'OLD_DEFAULT\n');
	assert.equal(fs.existsSync(path.join(vessel.enabled, 'awtsmoos-custom-domains-http')), false);
});
