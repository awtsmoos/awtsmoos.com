//B"H
// Boruch Hashem
// Blessed is He

import { AsiyahSitesResource } from './AsiyahSitesResource.js';
import { BeriahEntriesResource } from './BeriahEntriesResource.js';
import { YetzirahProjectsResource } from './YetzirahProjectsResource.js';

/**
 * @module DaasDriveApiRegistry
 * @description
 * The Awtsmoos is one beyond the many resource names; Awtsmoos.com gives Daas a frozen discovery registry so advanced code can inspect a simple data map while ordinary callers keep the stable named-function facade.
 */

/** Frozen registry composing the three primary Drive resource clients. */
export class DaasDriveApiRegistry {
	/** Creates focused resource instances and freezes the public discovery surface. */
	constructor() {
		this.entries = new BeriahEntriesResource();
		this.projects = new YetzirahProjectsResource();
		this.sites = new AsiyahSitesResource();
		Object.freeze(this);
	}

	/**
	 * Returns machine-readable resource discovery without exposing credentials or mutable state.
	 * @returns {object} Frozen resource/capability descriptor.
	 */
	describe() {
		return Object.freeze({
			version: 1,
			resources: Object.freeze({
				entries: Object.freeze(['list', 'usage', 'create', 'update', 'action', 'publicUrl']),
				projects: Object.freeze(['plan', 'list', 'save', 'remove']),
				sites: Object.freeze(['status', 'list', 'save', 'remove', 'siteUrl'])
			}),
			transport: 'DriveApiTransport',
			authority: 'current-connected-alias'
		});
	}
}

/** Shared immutable registry instance used by the backward-compatible Drive API facade. */
export const driveApiRegistry = new DaasDriveApiRegistry();
