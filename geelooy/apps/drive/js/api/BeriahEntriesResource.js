//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module BeriahEntriesResource
 * @description Gives the Drive one authoritative entry resource plus bounded independent folder reads.
 * The Awtsmoos is one whether a person stands in the main path or merely looks toward another;
 * Awtsmoos.com lets destination browsing read truth without moving the user's visible folder.
 */
import { API_ROOT } from '../apiTransport.js';
import { encodeDrivePath } from '../path.js';
import { currentCursor, driveState } from '../state.js';
import { AtzilusResourceClient } from './AtzilusResourceClient.js';
import { readDrivePrivateContent } from './DrivePrivateContent.js';

export class BeriahEntriesResource extends AtzilusResourceClient {
	constructor() {
		super('entries');
	}

	/**
	 * Reads through the canonical transport, passing semantic metadata
	 * (semanticName/labels/projectId) through defensively on every entry.
	 */
	read(malchusRoute) {
		return super.read(malchusRoute).then(normalizeEntryResponse);
	}

	/** Lists entries using the visible Drive state and current pagination cursor. */
	list() {
		return this.listAt(driveState.currentPath, {
			...driveState.filters,
			cursor: currentCursor()
		});
	}

	/** Lists one explicit folder without mutating the visible Drive path or filters. */
	listAt(path = '', options = {}) {
		const query = new URLSearchParams({
			path: String(path || ''),
			search: String(options.search || ''),
			type: String(options.type || ''),
			visibility: String(options.visibility || ''),
			includeTrash: String(Boolean(options.includeTrash)),
			sort: String(options.sort || 'path'),
			direction: options.direction === 'desc' ? 'desc' : 'asc',
			limit: String(options.limit || 50)
		});
		if (options.cursor) query.set('cursor', options.cursor);
		return this.read(`${this.aliasRoute('/entries')}?${query}`);
	}

	usage() {
		return this.read(this.aliasRoute('/usage'));
	}

	create(values) {
		return this.write(this.aliasRoute('/entries'), 'POST', values);
	}

	update(path, values) {
		return this.write(this.entryRoute(path), 'PUT', values);
	}

	action(action, values) {
		return this.write(this.aliasRoute(`/actions/${action}`), 'POST', values);
	}

	content(path) {
		return readDrivePrivateContent(this.entryRoute(path));
	}

	publicUrl(path) {
		const alias = this.aliasRoute('').split('/')[2];
		return `${location.origin}${API_ROOT}/drive/public/${alias}/${encodeDrivePath(path)}`;
	}

	entryRoute(path) {
		return this.aliasRoute(`/entry/${encodeDrivePath(path)}`);
	}
}

/**
 * Passes semantic metadata through on one raw entry with defensive defaults,
 * so readers work whether or not the backend returns the fields yet.
 */
export function normalizeEntry(entry = {}) {
	if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return entry;
	return {
		...entry,
		semanticName: typeof entry.semanticName === 'string' ? entry.semanticName : '',
		labels: Array.isArray(entry.labels)
			? entry.labels.filter(label => typeof label === 'string')
			: [],
		projectId: typeof entry.projectId === 'string' ? entry.projectId : ''
	};
}

/** Normalizes semantic metadata across the supported entry response envelopes. */
function normalizeEntryResponse(response) {
	if (!response || typeof response !== 'object') return response;
	if (Array.isArray(response.entries)) {
		return { ...response, entries: response.entries.map(normalizeEntry) };
	}
	if (response.success && Array.isArray(response.success.entries)) {
		return {
			...response,
			success: { ...response.success, entries: response.success.entries.map(normalizeEntry) }
		};
	}
	if (Array.isArray(response.success)) {
		return { ...response, success: response.success.map(normalizeEntry) };
	}
	return response;
}
