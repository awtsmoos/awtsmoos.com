// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module StudioDocumentMutations
 * @description
 * The Awtsmoos renews every real edit before history can call it past or future;
 * Awtsmoos.com refuses empty transactions and preserves document-wide patches so layers and keyframes share one recoverable gesture.
 */
import { StudioEntityFactory } from './StudioEntityFactory.js';

/** Applies undoable Studio-document mutations while keeping its editable JSON mirror synchronized. */
export class StudioDocumentMutations {
	/** Adds one authored entity, selects it, and records exactly one undoable edit. */
	static add(store, entity) {
		store.transact(state => this.patchDocument(state, [
			...(state.studioDocument?.entities || []),
			entity
		], entity.id));
	}

	/** Updates the selected entity only when a valid selection exists. */
	static updateSelected(store, mapper) {
		const state = store.get();
		const index = this.selectedIndex(state);
		if (index < 0) {
			return false;
		}
		store.transact(current => {
			const entities = [...(current.studioDocument?.entities || [])];
			entities[index] = mapper(entities[index]);
			return this.patchDocument(current, entities, current.selectedEntityId);
		});
		return true;
	}

	/** Removes the selected entity and selects the closest surviving layer. */
	static removeSelected(store) {
		const state = store.get();
		const index = this.selectedIndex(state);
		if (index < 0) {
			return false;
		}
		store.transact(current => {
			const entities = current.studioDocument?.entities || [];
			const nextEntities = entities.filter((_, entityIndex) => entityIndex !== index);
			const nextSelection = nextEntities[Math.min(index, nextEntities.length - 1)]?.id || null;
			return this.patchDocument(current, nextEntities, nextSelection);
		});
		return true;
	}

	/** Duplicates the selected entity with fresh identity and visible offset. */
	static duplicateSelected(store) {
		const state = store.get();
		const index = this.selectedIndex(state);
		if (index < 0) {
			return false;
		}
		const selected = state.studioDocument.entities[index];
		const duplicate = this.clone(selected);
		duplicate.id = StudioEntityFactory.id(selected.type || 'artwork');
		duplicate.name = `${selected.name || 'Artwork'} copy`;
		duplicate.transform = {
			...(duplicate.transform || {}),
			x: Number(duplicate.transform?.x || 0) + 24,
			y: Number(duplicate.transform?.y || 0) + 24
		};
		this.add(store, duplicate);
		return true;
	}

	/** Moves the selected layer one step only when the requested order really changes. */
	static moveSelected(store, direction) {
		const state = store.get();
		const entities = state.studioDocument?.entities || [];
		const from = this.selectedIndex(state);
		const to = Math.max(0, Math.min(entities.length - 1, from + direction));
		if (from < 0 || to === from) {
			return false;
		}
		store.transact(current => {
			const nextEntities = [...(current.studioDocument?.entities || [])];
			const [entity] = nextEntities.splice(from, 1);
			nextEntities.splice(to, 0, entity);
			return this.patchDocument(current, nextEntities, current.selectedEntityId);
		});
		return true;
	}

	/** Returns the selected entity index or -1 when selection does not map to a current layer. */
	static selectedIndex(state) {
		return (state.studioDocument?.entities || [])
			.findIndex(entity => entity.id === state.selectedEntityId);
	}

	/** Builds one synchronized state patch while preserving additional document-wide changes such as keyframes. */
	static patchDocument(state, entities, selectedEntityId, documentPatch = {}) {
		const document = {
			...(state.studioDocument || {}),
			...documentPatch,
			entities
		};
		return {
			studioDocument: document,
			studioJsonText: JSON.stringify(document, null, 2),
			studioJsonError: null,
			selectedEntityId
		};
	}

	/** Creates a deep serializable copy suitable for document duplication. */
	static clone(value) {
		return globalThis.structuredClone
			? globalThis.structuredClone(value)
			: JSON.parse(JSON.stringify(value));
	}
}
