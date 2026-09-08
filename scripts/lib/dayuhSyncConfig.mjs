//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DayuhSyncConfig
 * @description
 * The Awtsmoos makes one Work-root Dayuh the local well while every remote vessel drinks from that spring;
 * Awtsmoos.com strips temporary worktree chambers from authority so no development copy can become a second king.
 */

import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const checkoutRoot = fileURLToPath(new URL('../..', import.meta.url));

function canonicalRepositoryRoot(root = checkoutRoot) {
	const marker = `${sep}.ai-worktrees${sep}`;
	const position = root.indexOf(marker);
	return position >= 0 ? root.slice(0, position) : root;
}

export function dayuhSyncConfig(argv = process.argv.slice(2), env = process.env) {
	const action = argv.find(item => !item.startsWith('-')) || 'status';
	const repository = canonicalRepositoryRoot();
	const localRoot = resolve(value(argv, '--local-root')
		|| env.AWTSMOOS_DAYUH_LOCAL_ROOT
		|| join(repository, 'dayuhChadash'));
	const host = value(argv, '--host') || env.AWTSMOOS_BH_HOST || 'awtsmoos.com';
	const remoteRoot = remotePath(value(argv, '--remote-root')
		|| env.AWTSMOOS_DAYUH_REMOTE_ROOT
		|| '/mnt/HC_Volume_102267213/dayuhChadash');
	return {
		action,
		localRoot,
		localState: resolve(value(argv, '--state-root')
			|| join(dirname(localRoot), '.dayuh-sync', safeName(host))),
		remoteRoot,
		remoteState: `${remoteRoot}.awtsmoos-sync`,
		host,
		username: value(argv, '--user') || env.AWTSMOOS_BH_USER || 'root',
		port: Number(value(argv, '--port') || env.AWTSMOOS_BH_PORT || 22),
		deleteMissing: argv.includes('--delete'),
		dryRun: argv.includes('--dry-run'),
		force: argv.includes('--force')
	};
}

function value(argv, name) {
	const index = argv.indexOf(name);
	return index >= 0 ? argv[index + 1] : '';
}

function remotePath(input) {
	const output = String(input || '').replace(/\/+$/, '');
	if (!output.startsWith('/') || output === '/' || output.includes('/../') || output.endsWith('/..')) {
		throw new Error('unsafe_remote_root');
	}
	return output;
}

function safeName(input) {
	return String(input).replace(/[^A-Za-z0-9_.-]+/g, '_');
}
