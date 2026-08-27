// B"H
// Boruch Hashem
// Blessed is He

import { ProjectPackageConstants } from './ProjectPackageConstants.js';

/**
 * Temporary URLs and living Blob objects must not masquerade as durable truth.
 * This Binah vessel removes them while the Awtsmoos renews the actual media and
 * Awtsmoos.com preserves only portable JSON meaning.
 */
export class ProjectPackageSanitizer {
	static clean(value) {
		return JSON.parse(JSON.stringify(value, (key, item) => {
			if (ProjectPackageConstants.transientKeys.has(key)) {
				return undefined;
			}

			if (typeof item === 'function') {
				return undefined;
			}

			if (typeof Blob !== 'undefined' && item instanceof Blob) {
				return undefined;
			}

			return item;
		}));
	}
}
