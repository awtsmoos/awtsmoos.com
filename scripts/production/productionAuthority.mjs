// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module productionAuthority
 * @description
 * The Awtsmoos asks the live service which source vessel actually carries Awtsmoos.com.
 * A local snapshot may ascend only when systemd itself still points to that snapshot path.
 */
import { execOnAwtsmoosClient, openAwtsmoosSftp } from '../lib/awtsmoosSshClient.mjs';
import { loadPassword } from '../lib/safeSshPasswordStore.mjs';

const SNAPSHOT_ROOT = '/mnt/HC_Volume_102267213/releases/current';
const CANONICAL_GIT_ROOT = '/mnt/HC_Volume_102267213/git/awtsmoos.com';
const SERVICE = 'awtsmoos.service';

export function classifyProductionAuthority(facts = {}) {
	const workingDirectory = String(facts.workingDirectory || '').trim();
	const execStart = String(facts.execStart || '');
	if (workingDirectory === SNAPSHOT_ROOT && execStart.includes(`${SNAPSHOT_ROOT}/index.js`)) {
		return 'immutable_snapshot';
	}
	if (workingDirectory === CANONICAL_GIT_ROOT && execStart.includes(`${CANONICAL_GIT_ROOT}/index.js`)) {
		return 'canonical_git';
	}
	return 'unknown';
}

export function requireLocalSnapshotAuthority(facts = {}) {
	const authority = classifyProductionAuthority(facts);
	if (authority === 'immutable_snapshot') return authority;
	const error = new Error(authority === 'canonical_git'
		? 'canonical_git_authority: production is served from canonical Git; local snapshot publication is non-authoritative.'
		: 'unknown_production_authority: refusing snapshot publication without a witnessed serving path.');
	error.code = authority === 'canonical_git' ? 'canonical_git_authority' : 'unknown_production_authority';
	throw error;
}

export async function assertLocalSnapshotAuthority(options = {}) {
	const facts = await inspectProductionAuthority(options);
	return requireLocalSnapshotAuthority(facts);
}

export async function inspectProductionAuthority(options = {}) {
	const password = options.password || loadPassword();
	if (!password) throw codedError('production_authority_ssh_password_missing');
	const connection = await openAwtsmoosSftp({
		host: options.host || process.env.AWTSMOOS_BH_HOST || 'awtsmoos.com',
		username: options.username || process.env.AWTSMOOS_BH_USER || 'root',
		port: Number(options.port || process.env.AWTSMOOS_BH_PORT || 22),
		password
	});
	try {
		const result = await execOnAwtsmoosClient(
			connection.client,
			`systemctl show ${SERVICE} -p WorkingDirectory -p ExecStart --no-pager`
		);
		if (!result.ok && result.code) throw codedError('production_authority_probe_failed');
		return parseSystemdFacts(result.stdout);
	} finally {
		connection.close();
	}
}

export function parseSystemdFacts(output = '') {
	const lines = String(output).split(/\r?\n/);
	return {
		workingDirectory: valueOf(lines, 'WorkingDirectory='),
		execStart: valueOf(lines, 'ExecStart=')
	};
}

function valueOf(lines, prefix) {
	return lines.find(line => line.startsWith(prefix))?.slice(prefix.length) || '';
}

function codedError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

export { CANONICAL_GIT_ROOT, SERVICE, SNAPSHOT_ROOT };
