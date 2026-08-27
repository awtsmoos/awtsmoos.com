// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorObjectReaderDomain.js
 * @description
 * The Awtsmoos lets every Studio drawable reveal traits, representations, tags, and dependencies without surrendering mutable state;
 * Awtsmoos.com projects canonical entities into detached universal descriptors so agents can search the world without becoming its gate.
 */

import { KeterRenderableDescriptor } from '../../../renderable/model/RenderableDescriptor.js';
import { OR_RENDERABLE_TRAITS } from '../../../renderable/model/RenderableTraits.js';
import { OR_REPRESENTATION_KINDS } from '../../../renderable/schema/RepresentationSchemaData.js';

/** Reads universal renderable projections from the canonical Studio document. */
export class KeterAnimatorObjectReaderDomain {
	/** @param {object} malchusStore Shared NLE store. */
	constructor(malchusStore) {
		this.malchusStore = malchusStore;
	}

	/** @returns {object} Stable object-domain capabilities. */
	capabilities() {
		return {
			traits: [...OR_RENDERABLE_TRAITS],
			representationKinds: [...OR_REPRESENTATION_KINDS],
			defaultTextureCapability: true,
			mutableGpuHandlesInDocument: false
		};
	}

	/** @returns {object[]} Detached descriptors for every Studio drawable with a render specification. */
	list() {
		return this.entities()
			.filter((keliEntity) => Boolean(keliEntity.properties?.renderSpec))
			.map((keliEntity) => this.describe(keliEntity));
	}

	/** @param {string} sodObjectId Entity identity. @returns {object|null} Detached descriptor. */
	get(sodObjectId) {
		const keliEntity = this.entities().find((keli) => keli.id === sodObjectId);
		return keliEntity?.properties?.renderSpec ? this.describe(keliEntity) : null;
	}

	/** @param {object} keliFilter Data-only query filter. @returns {object[]} Matching descriptors. */
	query(keliFilter = {}) {
		const sodSelected = this.malchusStore.get().selectedEntityId ?? null;
		return this.list().filter((keliDescriptor) => (
			this.matches(keliDescriptor, keliFilter, sodSelected)
		));
	}

	/** @param {string} sodObjectId Object identity. @returns {object[]} Dependency descriptors that currently exist. */
	dependencies(sodObjectId) {
		const keliDescriptor = this.get(sodObjectId);
		if (!keliDescriptor) return [];
		return keliDescriptor.dependencies
			.map((sodDependencyId) => this.get(sodDependencyId))
			.filter(Boolean);
	}

	/** @param {string} sodObjectId Object identity. @returns {object[]} Descriptors that depend on the object. */
	dependents(sodObjectId) {
		return this.list().filter((keliDescriptor) => (
			keliDescriptor.dependencies.includes(sodObjectId)
		));
	}

	/** @returns {object[]} Current Studio entities. */
	entities() {
		return this.malchusStore.get().studioDocument?.entities ?? [];
	}

	/** @param {object} keliEntity Studio entity. @returns {object} Descriptor enriched with stable entity type/name/visibility. */
	describe(keliEntity) {
		return {
			...KeterRenderableDescriptor.fromEntity(keliEntity),
			type: String(keliEntity.type ?? 'unknown'),
			name: String(keliEntity.name ?? keliEntity.id ?? ''),
			visible: keliEntity.visible !== false
		};
	}

	/** @param {object} d Descriptor. @param {object} f Filter. @param {string|null} selected Selected ID. @returns {boolean} Match. */
	matches(d, f, selected) {
		if (f.id && d.objectId !== f.id) return false;
		if (f.type && d.type !== f.type) return false;
		if (f.trait && !d.traits.includes(f.trait)) return false;
		if (f.tag && !d.tags.includes(f.tag)) return false;
		if (typeof f.visible === 'boolean' && d.visible !== f.visible) return false;
		if (typeof f.selected === 'boolean' && (d.objectId === selected) !== f.selected) return false;
		const orSearch = String(f.search ?? f.text ?? '').trim().toLowerCase();
		return !orSearch || `${d.objectId} ${d.name} ${d.type} ${d.tags.join(' ')}`.toLowerCase().includes(orSearch);
	}
}
