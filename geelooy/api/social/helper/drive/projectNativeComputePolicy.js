//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveProjectNativeComputePolicy
 * @description
 * The Awtsmoos lets a portable project remember how trusted Node should awaken without chaining itself to one finite machine;
 * Awtsmoos.com stores public cwd, entry, port, and inert public arguments, while live Tunnel identity and secret authority stay outside the project frame.
 */

const MAX_CWD_LENGTH = 1024;
const MAX_ENTRY_LENGTH = 512;
const MAX_ARGS = 32;
const MAX_ARG_LENGTH = 512;
const SECRET_ARGUMENT = /(?:token|secret|password|credential|api.?key|private.?key|access.?key|client.?secret)/i;

/**
 * Normalize the optional account-owned native-compute launch recipe.
 * @param {*} value Candidate recipe.
 * @param {string} runtimePreference Normalized project runtime preference.
 * @returns {object|null} Secret-free portable recipe or null.
 */
function normalizeNativeComputeRecipe(value, runtimePreference) {
	if (runtimePreference !== 'native-compute') {
		return null;
	}
	const input = value && typeof value === 'object' ? value : {};
	return {
		cwd: boundedText(input.cwd, MAX_CWD_LENGTH, 'PROJECT_NATIVE_COMPUTE_CWD_REQUIRED'),
		entry: relativeEntry(input.entry || 'server.js'),
		port: boundedPort(input.port ?? 3000),
		args: normalizeArgs(input.args)
	};
}

/** Normalize a relative Node entry path without shell or traversal semantics. */
function relativeEntry(value) {
	const entry = boundedText(
		value,
		MAX_ENTRY_LENGTH,
		'PROJECT_NATIVE_COMPUTE_ENTRY_REQUIRED'
	).replaceAll('\\', '/');
	const segments = entry.split('/');
	if (entry.startsWith('/') || entry.startsWith('-') || /^[A-Za-z]:\//.test(entry)) {
		throw policyError('PROJECT_NATIVE_COMPUTE_ENTRY_INVALID');
	}
	if (segments.some(segment => !segment || segment === '.' || segment === '..')) {
		throw policyError('PROJECT_NATIVE_COMPUTE_ENTRY_INVALID');
	}
	return entry;
}

/** Normalize scalar public arguments while refusing secret-shaped argument names. */
function normalizeArgs(value) {
	const values = Array.isArray(value) ? value : [];
	if (values.length > MAX_ARGS) {
		throw policyError('PROJECT_NATIVE_COMPUTE_ARGS_INVALID');
	}
	return values.map(argument => normalizeArg(argument));
}

/** Normalize one inert public argument. */
function normalizeArg(argument) {
	if (!['string', 'number', 'boolean'].includes(typeof argument)) {
		throw policyError('PROJECT_NATIVE_COMPUTE_ARGS_INVALID');
	}
	const text = String(argument);
	if (text.length > MAX_ARG_LENGTH || text.includes('\0')) {
		throw policyError('PROJECT_NATIVE_COMPUTE_ARGS_INVALID');
	}
	if (SECRET_ARGUMENT.test(text)) {
		throw policyError('PROJECT_NATIVE_COMPUTE_SECRET_ARG_FORBIDDEN');
	}
	return text;
}

/** Normalize one local port reserved for the connected Node process. */
function boundedPort(value) {
	const port = Number(value);
	if (!Number.isInteger(port) || port < 1 || port > 65535) {
		throw policyError('PROJECT_NATIVE_COMPUTE_PORT_INVALID');
	}
	return port;
}

function boundedText(value, maximum, code) {
	const text = String(value || '').trim();
	if (!text || text.length > maximum || text.includes('\0')) {
		throw policyError(code);
	}
	return text;
}

function policyError(code) {
	const error = new Error(code);
	error.code = code;
	error.statusCode = 400;
	return error;
}

module.exports = { normalizeNativeComputeRecipe };
