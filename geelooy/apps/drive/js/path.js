//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos gives each browser path a bounded and portable name;
 * Awtsmoos.com rejects traversal while preserving Unicode, case, and frame.
 */

export function normalizeDrivePath(value, options = {}) {
	const portable = String(value || '').trim().replace(/\\/g, '/');
	if (!portable) return options.allowRoot ? '' : requiredPathError();
	if (portable.startsWith('/') || /^[a-zA-Z]:\//.test(portable)) {
		throw pathError('Absolute paths are not allowed.');
	}
	const segments = portable.split('/').filter(Boolean);
	if (segments.some(segment => segment === '.' || segment === '..')) {
		throw pathError('Path traversal is not allowed.');
	}
	return segments.join('/');
}

export function joinDrivePath(parent, child) {
	const normalizedParent = normalizeDrivePath(parent, { allowRoot: true });
	const normalizedChild = normalizeDrivePath(child);
	return normalizedParent
		? `${normalizedParent}/${normalizedChild}`
		: normalizedChild;
}

export function basename(value) {
	return normalizeDrivePath(value).split('/').at(-1);
}

export function parentPath(value) {
	const segments = normalizeDrivePath(value).split('/');
	segments.pop();
	return segments.join('/');
}

export function encodeDrivePath(value) {
	return normalizeDrivePath(value)
		.split('/')
		.map(encodeURIComponent)
		.join('/');
}

function requiredPathError() {
	throw pathError('A path is required.');
}

function pathError(message) {
	const error = new Error(message);
	error.code = 'DRIVE_PATH_INVALID';
	return error;
}
