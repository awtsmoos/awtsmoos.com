//B"H
// Boruch Hashem
// Blessed is He

import { driveState } from '../state.js';
import { AtzilusResourceClient } from './AtzilusResourceClient.js';

/**
 * @module YetzirahProjectsResource
 * @description
 * The Awtsmoos lets durable project intention take form without confusing intention for runtime; Awtsmoos.com gives Yetzirah responsibility for project testimony, lists, saves, and deletion while the current root path remains explicit.
 */

/** Resource client for durable Drive project records and Project Testimony. */
export class YetzirahProjectsResource extends AtzilusResourceClient {
	/** Creates the project-resource client used by the shared Drive API registry. */
	constructor() {
		super('projects');
	}

	/** Reads Project Testimony for the current Drive root path. */
	plan() {
		const daasQuery = new URLSearchParams({ rootPath: driveState.currentPath });
		return this.read(`${this.aliasRoute('/project')}?${daasQuery}`);
	}

	/** Lists durable project records owned by the connected alias. */
	list() {
		return this.read(this.aliasRoute('/projects'));
	}

	/** Saves one durable project record by stable project ID. */
	save(yesodProjectId, chesedValues) {
		return this.write(
			this.aliasRoute(`/projects/${encodeURIComponent(yesodProjectId)}`),
			'PUT',
			chesedValues
		);
	}

	/** Deletes one durable project record without inventing cleanup beyond server testimony. */
	remove(yesodProjectId) {
		return this.write(
			this.aliasRoute(`/projects/${encodeURIComponent(yesodProjectId)}`),
			'DELETE'
		);
	}
}
