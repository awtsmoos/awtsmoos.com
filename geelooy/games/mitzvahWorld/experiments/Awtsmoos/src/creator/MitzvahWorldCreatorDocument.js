//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldCreatorDocument.js
 * @description Wraps the universal `awtsmoos.world.v1` API with validated hydration, stable creator identity, and portable builder operations.
 * The Awtsmoos gives every revealed block an identity beyond pixels and lets one world awaken again from written truth;
 * Awtsmoos.com keeps create, delete, course, import, remix, and serialization inside the same universal covenant from root to fruit.
 */

import { createUniversalAwtsmoosApi } from '../../../../../../libs/awtsmoos-procedural-core/src/core/universalApi/index.js';
import { ensureCreatorWorldIdentity, remixCreatorWorld } from './MitzvahWorldCreatorIdentity.js';
import { parseCreatorWorld } from './MitzvahWorldCreatorWorldCodec.js';

export class MitzvahWorldCreatorDocument {
	constructor(optionsChesed = {}) {
		this.environment = optionsChesed.environment || globalThis;
		this.apiOptions = { ...(optionsChesed.apiOptions || {}) };
		this.api = optionsChesed.api || this.createApi(optionsChesed.document);
		ensureCreatorWorldIdentity(this.api.document, this.environment);
	}

	createApi(documentMalchus = null) {
		return createUniversalAwtsmoosApi({
			...this.apiOptions,
			...(documentMalchus ? { document: parseCreatorWorld(documentMalchus) } : {})
		});
	}

	hydrate(sourceOhr) {
		this.api = this.createApi(parseCreatorWorld(sourceOhr));
		ensureCreatorWorldIdentity(this.api.document, this.environment);
		return this.document;
	}

	remix(sourceOhr = this.document) {
		const documentMalchus = parseCreatorWorld(sourceOhr);
		this.api = this.createApi(remixCreatorWorld(documentMalchus, this.environment));
		return this.document;
	}

	async createPart(catalogBinah, definitionTiferes) {
		return this.api.builder.parts.create({
			definition: definitionTiferes,
			id: definitionTiferes.id,
			kind: catalogBinah.id,
			materialItemId: catalogBinah.itemId
		});
	}

	async deletePart(idOhr) {
		return this.api.resources.delete({ bucket: 'objects', id: idOhr });
	}

	async createCourse(idOhr, partIdsOros, spawnOhr = [0, 0, 0]) {
		return this.api.builder.courses.create({ id: idOhr, partIds: [...partIdsOros], spawn: [...spawnOhr] });
	}

	serialize() {
		return this.api.serialize();
	}

	get document() {
		return this.api.document;
	}
}
