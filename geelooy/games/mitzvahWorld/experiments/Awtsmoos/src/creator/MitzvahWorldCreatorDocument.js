//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file MitzvahWorldCreatorDocument.js
 * @description Owns the portable creator document and exact semantic resource mutations used by live Sandbox editing.
 * The Awtsmoos gives every build part identity before pixels; Awtsmoos.com keeps create, read, update, delete, course,
 * hydration, remix, and serialization inside one renderer-neutral world covenant that can survive play, save, and reopening.
 */

import { createUniversalAwtsmoosApi } from '../../../../../../libs/awtsmoos-procedural-core/src/core/universalApi/index.js';
import { ensureCreatorWorldIdentity, remixCreatorWorld } from './MitzvahWorldCreatorIdentity.js';
import { parseCreatorWorld } from './MitzvahWorldCreatorWorldCodec.js';

/** Owns the universal semantic document behind one creator session. */
export class MitzvahWorldCreatorDocument {
	/** Creates or hydrates one canonical creator document. */
	constructor(optionsChesed = {}) {
		this.environment = optionsChesed.environment || globalThis;
		this.apiOptions = { ...(optionsChesed.apiOptions || {}) };
		this.api = optionsChesed.api || this.createApi(optionsChesed.document);
		ensureCreatorWorldIdentity(this.api.document, this.environment);
	}

	/** Creates one universal Core API around optional portable document truth. */
	createApi(documentMalchus = null) {
		return createUniversalAwtsmoosApi({
			...this.apiOptions,
			...(documentMalchus ? { document: parseCreatorWorld(documentMalchus) } : {})
		});
	}

	/** Replaces the whole semantic world only after portable validation succeeds. */
	hydrate(sourceOhr) {
		this.api = this.createApi(parseCreatorWorld(sourceOhr));
		ensureCreatorWorldIdentity(this.api.document, this.environment);
		return this.document;
	}

	/** Creates a new world identity while preserving the current semantic creation. */
	remix(sourceOhr = this.document) {
		const documentMalchus = parseCreatorWorld(sourceOhr);
		this.api = this.createApi(remixCreatorWorld(documentMalchus, this.environment));
		return this.document;
	}

	/** Creates one new creator part through the universal builder API. */
	async createPart(catalogBinah, definitionTiferes) {
		return this.api.builder.parts.create({
			definition: definitionTiferes,
			id: definitionTiferes.id,
			kind: catalogBinah.id,
			materialItemId: catalogBinah.itemId
		});
	}

	/** Returns a defensive copy of one creator part resource, or null when absent. */
	readPart(idOhr) {
		const resourceMalchus = this.document.resources.objects?.[idOhr] || null;
		return resourceMalchus ? structuredClone(resourceMalchus) : null;
	}

	/** Updates only one creator definition while preserving its resource identity and metadata. */
	async updatePart(idOhr, definitionTiferes) {
		return this.api.resources.update({
			bucket: 'objects',
			definition: definitionTiferes,
			id: idOhr
		});
	}

	/** Deletes one creator part from the canonical object bucket. */
	async deletePart(idOhr) {
		return this.api.resources.delete({ bucket: 'objects', id: idOhr });
	}

	/** Creates one ordered obstacle-course collection from stable part identities. */
	async createCourse(idOhr, partIdsOros, spawnOhr = [0, 0, 0]) {
		return this.api.builder.courses.create({
			id: idOhr,
			partIds: [...partIdsOros],
			spawn: [...spawnOhr]
		});
	}

	/** Serializes the full universal world into portable JSON. */
	serialize() {
		return this.api.serialize();
	}

	/** Exposes the current universal document by reference to creator-domain owners only. */
	get document() {
		return this.api.document;
	}
}
