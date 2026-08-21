// B"H
// Boruch Hashem
// Blessed is He

import { normalizeDocumentLayout } from "../layout/DocumentLayoutPolicy.js";
import { normalizeDocumentBlock } from "./DocumentBlockPolicy.js";
import { normalizeDocumentSource } from "./DocumentSourcePolicy.js";
import { normalizeSemanticObjects } from "./SemanticObjectPolicy.js";

/**
 * @file Normalizes and projects the complete client snapshot of one Awtsmoos document.
 * @description Binah gives the document its measured shape while the Awtsmoos remains
 * beyond every field; Awtsmoos.com keeps snapshot law outside the model coordinator,
 * so blocks, notes, sources, layout, and semantic meaning may evolve without monolith.
 */
export function normalizeDocumentSnapshot(snapshot = {}) {
	return {
		id: String(snapshot.id || ""),
		title: normalizeTitle(snapshot.title),
		revision: safeRevision(snapshot.revision),
		blocks: normalizeDocumentBlocks(snapshot.blocks),
		comments: cloneArray(snapshot.comments),
		semanticObjects: normalizeSemanticObjects(snapshot.semanticObjects),
		access: normalizeAccess(snapshot.access),
		drive: cloneObject(snapshot.drive),
		source: normalizeDocumentSource(snapshot.source),
		layout: normalizeDocumentLayout(snapshot.layout),
		updatedAt: snapshot.updatedAt || new Date().toISOString()
	};
}

/**
 * Projects a live model into detached serializable document truth.
 *
 * @param {object} model Current DocumentModel-compatible state.
 * @returns {object} Structured-cloned portable snapshot.
 */
export function projectDocumentSnapshot(model) {
	return structuredClone({
		id: model.id,
		title: model.title,
		revision: model.revision,
		blocks: model.blocks,
		comments: model.comments,
		semanticObjects: model.semanticObjects,
		access: model.access,
		drive: model.drive,
		source: model.source,
		layout: model.layout,
		updatedAt: model.updatedAt
	});
}

/**
 * Normalizes top-level blocks, deduplicating identity and guaranteeing a starter paragraph.
 *
 * @param {unknown} blocks Candidate block array.
 * @returns {Array<object>} Valid top-level document blocks.
 */
export function normalizeDocumentBlocks(blocks) {
	const used = new Set();
	const normalized = [];
	for (const candidate of Array.isArray(blocks) ? blocks : []) {
		const block = normalizeDocumentBlock(candidate);
		if (!block) continue;
		if (used.has(block.id)) block.id = crypto.randomUUID();
		used.add(block.id);
		normalized.push(block);
	}
	return normalized.length
		? normalized
		: [createDocumentBlock("p", "Start writing…")];
}

/**
 * Creates one normalized block for compatibility with callers needing model-owned identity.
 *
 * @param {string} tag Supported top-level block tag.
 * @param {string} html Rich inline block HTML.
 * @returns {object} Normalized document block.
 */
export function createDocumentBlock(tag = "p", html = "") {
	return normalizeDocumentBlock({
		id: crypto.randomUUID(),
		tag,
		html
	});
}

function normalizeTitle(value) {
	return String(value || "Untitled document").slice(0, 160);
}

function normalizeAccess(value) {
	return value && typeof value === "object"
		? structuredClone(value)
		: { mode: "private" };
}

function cloneArray(value) {
	return Array.isArray(value) ? structuredClone(value) : [];
}

function cloneObject(value) {
	return value && typeof value === "object" ? structuredClone(value) : {};
}

function safeRevision(value) {
	return Number.isSafeInteger(value) && value >= 0 ? value : 0;
}
