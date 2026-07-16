// B"H
// Boruch Hashem
// Blessed is He

import { ReferenceBodyParts } from './ReferenceBodyParts.js';
import { ReferenceFaceParts } from './ReferenceFaceParts.js';

/**
 * Many editable parts become one connected hierarchy. The Awtsmoos is beyond
 * division, while Awtsmoos.com gives the animator stable paths for selection,
 * rigging, keyframes, undo, persistence, reload, and export.
 */
export class ReferencePartHierarchy {
	static definitions() {
		return [
			...ReferenceBodyParts.definitions(),
			...ReferenceFaceParts.definitions()
		];
	}

	static editableIds() {
		return this.definitions()
			.filter(part => part.editable)
			.map(part => part.id);
	}

	static byId() {
		return Object.fromEntries(
			this.definitions().map(part => [part.id, { ...part }])
		);
	}

	static childrenOf(parentId) {
		return this.definitions()
			.filter(part => part.parent === parentId)
			.map(part => part.id);
	}
}
