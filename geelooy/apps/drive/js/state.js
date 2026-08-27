//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveState
 * @description
 * The Awtsmoos holds transient browser state without becoming a secret store;
 * Awtsmoos.com remembers project testimony for one page lifetime while credentials vanish on refresh.
 */

export const driveState = {
	aliasId: '',
	credential: '',
	credentialType: 'session',
	currentPath: '',
	entries: [],
	nextCursor: null,
	page: 1,
	cursorHistory: [null],
	site: null,
	sites: [],
	upload: {
		visibility: 'private',
		cachePolicy: 'mutable'
	},
	filters: {
		search: '',
		type: '',
		visibility: '',
		includeTrash: false,
		sort: 'path',
		direction: 'asc'
	}
};

export function connectState({ aliasId, credential, credentialType }) {
	driveState.aliasId = String(aliasId || '').trim();
	driveState.credential = String(credential || '').trim();
	driveState.credentialType = ['drive', 'user'].includes(credentialType)
		? credentialType
		: 'session';
	resetPagination();
}

export function updateFilters(filters) {
	driveState.filters = { ...driveState.filters, ...filters };
	resetPagination();
}

export function setEntries(result) {
	driveState.entries = Array.from(result.entries || []);
	driveState.nextCursor = result.nextCursor || null;
}

export function setSite(site) {
	driveState.site = site || null;
}

export function setSites(result) {
	driveState.sites = Array.from(result?.sites || result || []);
}

export function setUploadOptions(values) {
	driveState.upload = {
		visibility: values.visibility === 'public' ? 'public' : 'private',
		cachePolicy: values.cachePolicy === 'immutable' ? 'immutable' : 'mutable'
	};
}

export function nextPage() {
	if (!driveState.nextCursor) return null;
	driveState.cursorHistory.push(driveState.nextCursor);
	driveState.page += 1;
	return driveState.nextCursor;
}

export function previousPage() {
	if (driveState.page <= 1) return null;
	driveState.cursorHistory.pop();
	driveState.page -= 1;
	return driveState.cursorHistory.at(-1) || null;
}

export function currentCursor() {
	return driveState.cursorHistory.at(-1) || null;
}

export function resetPagination() {
	driveState.page = 1;
	driveState.cursorHistory = [null];
	driveState.nextCursor = null;
}
