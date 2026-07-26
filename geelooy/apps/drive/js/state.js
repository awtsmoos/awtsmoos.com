//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos holds browser state as a temporary vessel, never a secret store;
 * Awtsmoos.com forgets credentials on refresh and reveals canonical paths once more.
 */

export const driveState = {
	aliasId: '',
	credential: '',
	credentialType: 'drive',
	currentPath: '',
	entries: [],
	nextCursor: null,
	page: 1,
	cursorHistory: [null],
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
	driveState.credentialType = credentialType === 'user' ? 'user' : 'drive';
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
