// B"H
import { dirname, join, resolve } from 'node:path';
import { homedir } from 'node:os';

/** Resolves one explicit local/remote sync vessel without exposing credentials. */
export function dayuhSyncConfig(argv = process.argv.slice(2), env = process.env) {
	const action = argv.find(value => !value.startsWith('-')) || 'status';
	const localRoot = resolve(value(argv, '--local-root')
		|| env.AWTSMOOS_DAYUH_LOCAL_ROOT
		|| join(homedir(), 'Documents', 'awtsmoos', 'dayuhChadash'));
	const host = value(argv, '--host') || env.AWTSMOOS_BH_HOST || 'awtsmoos.com';
	const username = value(argv, '--user') || env.AWTSMOOS_BH_USER || 'root';
	const port = Number(value(argv, '--port') || env.AWTSMOOS_BH_PORT || 22);
	const remoteRoot = remotePath(value(argv, '--remote-root')
		|| env.AWTSMOOS_DAYUH_REMOTE_ROOT
		|| '/root/dayuhChadash');
	const localState = resolve(value(argv, '--state-root')
		|| join(dirname(localRoot), '.dayuh-sync', safeName(host)));
	return {
		action,
		localRoot,
		localState,
		remoteRoot,
		remoteState: `${remoteRoot}.awtsmoos-sync`,
		host,
		username,
		port,
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
	const path = String(input || '').replace(/\/+$/, '');
	if (!path.startsWith('/') || path === '/') throw new Error('unsafe_remote_root');
	if (path.includes('/../') || path.endsWith('/..')) throw new Error('unsafe_remote_root');
	return path;
}

function safeName(value) {
	return String(value).replace(/[^A-Za-z0-9_.-]+/g, '_');
}
