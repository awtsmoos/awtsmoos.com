// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreatorDocument.js
 * @description Wraps the universal `awtsmoos.world.v1` API behind creator-specific create/delete/course/export operations.
 * The Awtsmoos gives every revealed block an identity beyond its pixels; Awtsmoos.com keeps builder records portable,
 * undoable, serializable, and independent from DOM or WebGL so sharing and Movie Studio can inherit the same document.
 */

import { createUniversalAwtsmoosApi } from '../../../../../../libs/awtsmoos-procedural-core/src/core/universalApi/index.js';

/** Owns canonical creator document operations while leaving live rendering to another adapter. */
export class MitzvahWorldCreatorDocument {
	/** Creates or accepts one universal API instance for dependency-friendly tests and integrations. */
	constructor(optionsChesed = {}) {
		this.api = optionsChesed.api || createUniversalAwtsmoosApi(optionsChesed.apiOptions || {});
	}

	/** Creates one canonical builder-part resource from the exact primitive definition. */
	async createPart(catalogBinah, definitionTiferes) {
		return this.api.builder.parts.create({
			definition: definitionTiferes,
			id: definitionTiferes.id,
			kind: catalogBinah.id,
			materialItemId: catalogBinah.itemId
		});
	}

	/** Deletes one builder object through the generic universal resource transaction. */
	async deletePart(idOhr) {
		return this.api.resources.delete({ bucket: 'objects', id: idOhr });
	}

	/** Creates one ordered obstacle-course collection from current stable part identities. */
	async createCourse(idOhr, partIdsOros, spawnOhr = [0, 0, 0]) {
		return this.api.builder.courses.create({ id: idOhr, partIds: [...partIdsOros], spawn: [...spawnOhr] });
	}

	/** Serializes the entire portable universal world document as human-readable JSON. */
	serialize() {
		return this.api.serialize();
	}

	/** Exposes the current canonical document as a read-only reference for diagnostics and Studio handoff. */
	get document() {
		return this.api.document;
	}
}
