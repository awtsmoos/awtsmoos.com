//B"H
// Boruch Hashem
// Blessed is He

import { API_ROOT } from '../apiTransport.js';
import { encodeDrivePath } from '../path.js';
import { currentCursor, driveState } from '../state.js';
import { AtzilusResourceClient } from './AtzilusResourceClient.js';

/**
 * @module BeriahEntriesResource
 * @description
 * The Awtsmoos gives files and folders form without hiding their source path; Awtsmoos.com gives Beriah responsibility for entry inventory, usage, mutations, and public file URLs while pagination state stays in the canonical Drive state vessel.
 */

/** Resource client for Drive entries, usage, and entry actions. */
export class BeriahEntriesResource extends AtzilusResourceClient {
	/** Creates the file-resource client used by the shared Drive API registry. */
	constructor() {
		super('entries');
	}

	/**
	 * Lists entries using the current Drive path, filters, sort, and cursor state.
	 * @returns {Promise<object>} Entry-list testimony.
	 */
	list() {
		const daasQuery = new URLSearchParams({
			path: driveState.currentPath,
			search: driveState.filters.search,
			type: driveState.filters.type,
			visibility: driveState.filters.visibility,
			includeTrash: String(driveState.filters.includeTrash),
			sort: driveState.filters.sort,
			direction: driveState.filters.direction,
			limit: '50'
		});
		const yesodCursor = currentCursor();
		if (yesodCursor) {
			daasQuery.set('cursor', yesodCursor);
		}
		return this.read(`${this.aliasRoute('/entries')}?${daasQuery}`);
	}

	/** Returns current storage usage for the connected alias. */
	usage() {
		return this.read(this.aliasRoute('/usage'));
	}

	/** Creates one new Drive entry from explicit metadata. */
	create(chesedValues) {
		return this.write(this.aliasRoute('/entries'), 'POST', chesedValues);
	}

	/** Updates one existing Drive entry by canonical encoded path. */
	update(yesodPath, gevurahValues) {
		return this.write(this.entryRoute(yesodPath), 'PUT', gevurahValues);
	}

	/** Runs one named Drive entry action such as move, copy, restore, or trash. */
	action(gevurahAction, chesedValues) {
		return this.write(this.aliasRoute(`/actions/${gevurahAction}`), 'POST', chesedValues);
	}

	/** Builds the canonical public URL for one Drive file path. */
	publicUrl(yesodPath) {
		return `${location.origin}${API_ROOT}/drive/public/${this.aliasRoute('').split('/')[2]}/${encodeDrivePath(yesodPath)}`;
	}

	/** Builds the canonical mutation route for one encoded entry path. */
	entryRoute(yesodPath) {
		return this.aliasRoute(`/entry/${encodeDrivePath(yesodPath)}`);
	}
}
