// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorObjectWriterDomain.js
 * @description
 * The Awtsmoos lets durable render traits and representation recipes change while temporary GPU garments remain outside authored truth;
 * Awtsmoos.com rewrites one validated Studio document through one transaction, keeping undo, timeline mirrors, and future export in youth.
 */

import { TiferesRenderableTraits } from '../../../renderable/model/RenderableTraits.js';
import { StudioDocumentCodec } from '../../../studio/document/StudioDocumentCodec.js';

/** Applies universal renderable metadata mutations through the canonical Studio document transaction path. */
export class MalchusAnimatorObjectWriterDomain {
	/** @param {object} malchusStore Shared NLE store. */
	constructor(malchusStore) {
		this.malchusStore = malchusStore;
	}

	/** @param {string} sodObjectId Entity ID. @param {object} keliRenderable Explicit durable renderable data. @returns {object} Updated entity. */
	setRenderable(sodObjectId, keliRenderable) {
		return this.update(sodObjectId, (keliEntity) => ({
			...keliEntity,
			renderable: structuredClone(keliRenderable ?? {})
		}));
	}

	/** @param {string} sodObjectId Entity ID. @param {string} shemKind Representation kind. @param {object} keliRepresentation Recipe. @returns {object} Updated entity. */
	setRepresentation(sodObjectId, shemKind, keliRepresentation) {
		return this.update(sodObjectId, (keliEntity) => ({
			...keliEntity,
			renderable: {
				...(keliEntity.renderable ?? {}),
				representations: {
					...(keliEntity.renderable?.representations ?? {}),
					[shemKind]: structuredClone(keliRepresentation ?? {})
				}
			}
		}));
	}

	/** @param {string} sodObjectId Entity ID. @param {string[]} sederTraits Explicit traits. @returns {object} Updated entity. */
	setTraits(sodObjectId, sederTraits) {
		const sederNormalized = TiferesRenderableTraits.normalize(sederTraits);
		return this.update(sodObjectId, (keliEntity) => ({
			...keliEntity,
			renderable: {
				...(keliEntity.renderable ?? {}),
				traits: sederNormalized
			}
		}));
	}

	/** @param {string} sodObjectId Entity ID. @param {Function} mitzvahTransform Entity transformer. @returns {object} Updated detached entity. */
	update(sodObjectId, mitzvahTransform) {
		const keliDocument = this.currentDocument();
		let yesodFound = false;
		const sederEntities = keliDocument.entities.map((keliEntity) => {
			if (keliEntity.id !== sodObjectId) return keliEntity;
			yesodFound = true;
			return mitzvahTransform(structuredClone(keliEntity));
		});
		if (!yesodFound) {
			throw this.notFound(sodObjectId);
		}
		const keliNextDocument = {
			...keliDocument,
			entities: sederEntities
		};
		StudioDocumentCodec.assert(keliNextDocument);
		this.malchusStore.transact((keliCurrent) => (
			StudioDocumentCodec.installPatch(keliCurrent, keliNextDocument)
		));
		return structuredClone(sederEntities.find((keli) => keli.id === sodObjectId));
	}

	/** @returns {object} Detached current Studio document. */
	currentDocument() {
		const keliDocument = this.malchusStore.get().studioDocument;
		if (!keliDocument) {
			const gevurahError = new Error('No Studio document is installed.');
			gevurahError.code = 'missing_studio_document';
			throw gevurahError;
		}
		return structuredClone(keliDocument);
	}

	/** @param {string} sodObjectId Missing ID. @returns {Error} Stable not-found error. */
	notFound(sodObjectId) {
		const gevurahError = new Error(`Renderable object not found: ${sodObjectId}`);
		gevurahError.code = 'object_not_found';
		return gevurahError;
	}
}
