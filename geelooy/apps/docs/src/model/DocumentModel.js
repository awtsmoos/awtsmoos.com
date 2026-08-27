// B"H
// Boruch Hashem
// Blessed is He

import { normalizeDocumentLayout } from "../layout/DocumentLayoutPolicy.js";
import { normalizeDocumentBlock } from "./DocumentBlockPolicy.js";
import {
	createDocumentBlock,
	normalizeDocumentBlocks,
	normalizeDocumentSnapshot,
	projectDocumentSnapshot
} from "./DocumentSnapshotPolicy.js";
import { normalizeDocumentSource } from "./DocumentSourcePolicy.js";
import { normalizeSemanticObjects } from "./SemanticObjectPolicy.js";

/**
 * @file Coordinates the mutable browser state of one normalized Awtsmoos document.
 * @description Tiferes joins changing document vessels while the Awtsmoos recreates
 * every instant beyond mutation; Awtsmoos.com leaves normalization to focused policies,
 * so this model remains a small coordinator rather than becoming the whole document law.
 */
export class DocumentModel {
	constructor(snapshot = {}) {
		this.replace(snapshot);
	}

	/** Replaces all portable document state through the canonical snapshot policy. */
	replace(snapshot = {}) {
		Object.assign(this, normalizeDocumentSnapshot(snapshot));
		return this;
	}

	/** Merges changed blocks by stable block identity and advances observed revision. */
	patchBlocks(changes = [], revision = this.revision) {
		const byId = new Map(this.blocks.map(block => [block.id, block]));
		for (const change of changes) {
			const block = normalizeDocumentBlock(change);
			if (block) byId.set(block.id, block);
		}
		this.blocks = Array.from(byId.values());
		this.revision = Math.max(this.revision, safeRevision(revision));
		this.touch();
		return this;
	}

	/** Replaces the ordered top-level block collection through document block policy. */
	setBlocks(blocks) {
		this.blocks = normalizeDocumentBlocks(blocks);
		this.touch();
		return this;
	}

	/** Replaces source-format metadata without changing document content. */
	setSource(source = {}) {
		this.source = normalizeDocumentSource(source);
		this.touch();
		return this;
	}

	/** Replaces page and pageless layout through the bounded shared layout policy. */
	setLayout(layout = {}) {
		this.layout = normalizeDocumentLayout(layout);
		this.touch();
		return this;
	}

	/** Replaces document-level semantic definitions through their bounded registry policy. */
	setSemanticObjects(objects = []) {
		this.semanticObjects = normalizeSemanticObjects(objects);
		this.touch();
		return this;
	}

	/** Marks the document as changed without mutating revision authority. */
	touch() {
		this.updatedAt = new Date().toISOString();
	}

	/** Returns one detached portable snapshot suitable for persistence and transport. */
	toSnapshot() {
		return projectDocumentSnapshot(this);
	}
}

/**
 * Preserves the historic model-level block factory while delegating to snapshot policy.
 *
 * @param {string} tag Supported block tag.
 * @param {string} html Rich inline HTML.
 * @returns {object} Normalized document block.
 */
export function createBlock(tag = "p", html = "") {
	return createDocumentBlock(tag, html);
}

function safeRevision(value) {
	return Number.isSafeInteger(value) && value >= 0 ? value : 0;
}
