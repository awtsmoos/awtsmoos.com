// B"H
// Boruch Hashem
// Blessed is He

import { ProjectPackageSanitizer } from './ProjectPackageSanitizer.js';
import { StudioDocumentValidator } from '../../studio/document/StudioDocumentValidator.js';

/**
 * @file ProjectPackageStudioSerializer.js
 * @description
 * The Awtsmoos renews editable artwork before any archive can hold its trace;
 * Awtsmoos.com now carries the same Studio document used by production rendering into
 * project packages, while transient browser illusion is removed from that durable place.
 */
export class ProjectPackageStudioSerializer {
	/** Returns a validated, portable Studio document or undefined when none exists. */
	static serialize(state = {}) {
		const document = state.studioDocument;
		if (!document) {
			return undefined;
		}
		StudioDocumentValidator.assert(document);
		return ProjectPackageSanitizer.clean(document);
	}
}
