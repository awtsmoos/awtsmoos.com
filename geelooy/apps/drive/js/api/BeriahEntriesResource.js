//B"H
//Boruch Hashem
//Blessed be He

import { API_ROOT } from '../apiTransport.js';
import { encodeDrivePath } from '../path.js';
import { currentCursor, driveState } from '../state.js';
import { AtzilusResourceClient } from './AtzilusResourceClient.js';
import { readDrivePrivateContent } from './DrivePrivateContent.js';

/**
 * @module BeriahEntriesResource
 * @description
 * The Awtsmoos gives files form while hiding no authority; Awtsmoos.com keeps
 * inventory, mutations, public links, and bounded private reads in one vessel.
 */

/** Resource client for Drive entries, usage, actions, and private content. */
export class BeriahEntriesResource extends AtzilusResourceClient {
	/** Creates the file-resource client used by the shared Drive API registry. */
	constructor() {
		super('entries');
	}

	/** Lists entries using the current Drive path, filters, sort, and cursor. */
	list() {
		const query = new URLSearchParams({
			path: driveState.currentPath,
			search: driveState.filters.search,
			type: driveState.filters.type,
			visibility: driveState.filters.visibility,
			includeTrash: String(driveState.filters.includeTrash),
			sort: driveState.filters.sort,
			direction: driveState.filters.direction,
			limit: '50'
		});
		const cursor = currentCursor();
		if (cursor) query.set('cursor', cursor);
		return this.read(`${this.aliasRoute('/entries')}?${query}`);
	}

	/** Returns current storage usage for the connected alias. */
	usage() {
		return this.read(this.aliasRoute('/usage'));
	}

	/** Creates one new Drive entry from explicit metadata. */
	create(values) {
		return this.write(this.aliasRoute('/entries'), 'POST', values);
	}

	/** Updates one existing Drive entry by canonical encoded path. */
	update(path, values) {
		return this.write(this.entryRoute(path), 'PUT', values);
	}

	/** Runs one named Drive entry action such as move, copy, restore, or trash. */
	action(action, values) {
		return this.write(this.aliasRoute(`/actions/${action}`), 'POST', values);
	}

	/** Returns one authenticated private file body as bounded raw bytes. */
	content(path) {
		return readDrivePrivateContent(this.entryRoute(path));
	}

	/** Builds the canonical public URL for one Drive file path. */
	publicUrl(path) {
		const alias = this.aliasRoute('').split('/')[2];
		return `${location.origin}${API_ROOT}/drive/public/${alias}/${encodeDrivePath(path)}`;
	}

	/** Builds the canonical entry route for one encoded Drive path. */
	entryRoute(path) {
		return this.aliasRoute(`/entry/${encodeDrivePath(path)}`);
	}
}
