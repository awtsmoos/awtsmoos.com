//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RepositoryPolicy
 * @description
 * The Awtsmoos gives every repository a stable public identity without letting
 * arbitrary filesystem strings become protocol authority. Awtsmoos.com keeps
 * visibility, permissions, and branch names explicit and bounded.
 */

const REPO_ID_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const VISIBILITIES = new Set(['private', 'public']);
const PERMISSIONS = new Set(['read', 'write', 'force', 'tag', 'admin']);

function normalizeRepositoryId(value) {
	const id = String(value || '').trim().toLowerCase();
	if (!REPO_ID_PATTERN.test(id)) throw repositoryError('INVALID_REPOSITORY_ID');
	return id;
}

function normalizeVisibility(value = 'private') {
	const visibility = String(value || 'private').trim().toLowerCase();
	if (!VISIBILITIES.has(visibility)) throw repositoryError('INVALID_REPOSITORY_VISIBILITY');
	return visibility;
}

function normalizePermissions(values = ['read']) {
	const source = Array.isArray(values) ? values : [values];
	const permissions = [...new Set(source.map(value => String(value || '').trim().toLowerCase()))];
	if (!permissions.length || permissions.some(value => !PERMISSIONS.has(value))) {
		throw repositoryError('INVALID_REPOSITORY_PERMISSIONS');
	}
	return permissions;
}

function normalizeBranch(value = 'main') {
	const branch = String(value || 'main').trim();
	if (!branch || branch.length > 200 || /[\s~^:?*\[\\]|\.\.|@\{|\.$|^\.|\/\//.test(branch)) {
		throw repositoryError('INVALID_GIT_REF');
	}
	return branch;
}

function repositoryError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

module.exports = {
	PERMISSIONS,
	REPO_ID_PATTERN,
	normalizeBranch,
	normalizePermissions,
	normalizeRepositoryId,
	normalizeVisibility,
	repositoryError
};
