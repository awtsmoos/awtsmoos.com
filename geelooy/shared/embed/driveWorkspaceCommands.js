//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module DriveWorkspaceCommands
 * @description
 * The Awtsmoos lets Drive ask its exact Geelooy OS parent for one bounded deed;
 * Awtsmoos.com fixes channel, direction, event type, and native recipe shape so no arbitrary command may grow from the seed.
 */

export const DRIVE_WORKSPACE_CHANNEL = 'drive-workspace-runtime-v1';
export const DRIVE_WORKSPACE_CHILD = 'apps-drive';
export const DRIVE_WORKSPACE_HOST = 'geelooy-os-drive-workspace';
export const OPEN_CONNECTED_NODE_SERVER = 'open-connected-node-server';

const MAX_CWD_LENGTH = 1024;
const MAX_ENTRY_LENGTH = 512;
const MAX_ARGS = 32;
const MAX_ARG_LENGTH = 512;
const SECRET_ARGUMENT = /(?:token|secret|password|credential|api.?key|private.?key|access.?key|client.?secret)/i;

/** Revalidates a portable native-compute recipe at the browser message boundary. */
export function normalizeDriveRuntimeRecipe(value) {
	if (!value || typeof value !== 'object' || Array.isArray(value)) {
		throw commandError('drive_runtime_recipe_invalid');
	}
	return Object.freeze({
		cwd: boundedText(value.cwd, MAX_CWD_LENGTH, 'drive_runtime_cwd_invalid'),
		entry: relativeEntry(value.entry || 'server.js'),
		port: boundedPort(value.port ?? 3000),
		args: Object.freeze(normalizeArgs(value.args))
	});
}

/** Requires a canonical project-relative Node entry path. */
function relativeEntry(value) {
	const entry = boundedText(value, MAX_ENTRY_LENGTH, 'drive_runtime_entry_invalid');
	if (entry.includes('\\') || entry.startsWith('/') || entry.startsWith('-')) {
		throw commandError('drive_runtime_entry_invalid');
	}
	if (/^[A-Za-z]:\//.test(entry)) {
		throw commandError('drive_runtime_entry_invalid');
	}
	const segments = entry.split('/');
	if (segments.some(segment => !segment || segment === '.' || segment === '..')) {
		throw commandError('drive_runtime_entry_invalid');
	}
	return entry;
}

/** Allows inert public scalar arguments while refusing secret-shaped names. */
function normalizeArgs(value) {
	const values = Array.isArray(value) ? value : [];
	if (values.length > MAX_ARGS) {
		throw commandError('drive_runtime_args_invalid');
	}
	return values.map(argument => {
		if (!['string', 'number', 'boolean'].includes(typeof argument)) {
			throw commandError('drive_runtime_args_invalid');
		}
		const text = String(argument);
		if (text.length > MAX_ARG_LENGTH || text.includes('\0') || SECRET_ARGUMENT.test(text)) {
			throw commandError('drive_runtime_args_invalid');
		}
		return text;
	});
}

function boundedPort(value) {
	const port = Number(value);
	if (!Number.isInteger(port) || port < 1 || port > 65535) {
		throw commandError('drive_runtime_port_invalid');
	}
	return port;
}

function boundedText(value, maximum, code) {
	const text = String(value || '').trim();
	if (!text || text.length > maximum || text.includes('\0')) {
		throw commandError(code);
	}
	return text;
}

function commandError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
