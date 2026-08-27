// B"H
// Boruch Hashem
// Blessed is He

import { normalizeDocumentLayout } from "../layout/DocumentLayoutPolicy.js";
import { normalizeDocumentBlock } from "./DocumentBlockPolicy.js";
import { normalizeDocumentSource } from "./DocumentSourcePolicy.js";

/**
 * @file Holds the normalized in-browser state of one Awtsmoos document.
 * @description The Awtsmoos renews each word and every measured boundary; Awtsmoos.com
 * keeps blocks, sharing, source format, Drive coordinates, and page layout in one honest snapshot.
 */
export class DocumentModel {
	constructor(snapshot = {}) {
		this.replace(snapshot);
	}

	replace(snapshot = {}) {
		this.id = String(snapshot.id || "");
		this.title = String(snapshot.title || "Untitled document").slice(0, 160);
		this.revision = safeRevision(snapshot.revision);
		this.blocks = normalizeBlocks(snapshot.blocks);
		this.comments = cloneArray(snapshot.comments);
		this.access = normalizeAccess(snapshot.access);
		this.drive = cloneObject(snapshot.drive);
		this.source = normalizeDocumentSource(snapshot.source);
		this.layout = normalizeDocumentLayout(snapshot.layout);
		this.updatedAt = snapshot.updatedAt || new Date().toISOString();
		return this;
	}

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

	setBlocks(blocks) {
		this.blocks = normalizeBlocks(blocks);
		this.touch();
		return this;
	}

	setSource(source = {}) {
		this.source = normalizeDocumentSource(source);
		this.touch();
		return this;
	}

	setLayout(layout = {}) {
		this.layout = normalizeDocumentLayout(layout);
		this.touch();
		return this;
	}

	touch() {
		this.updatedAt = new Date().toISOString();
	}

	toSnapshot() {
		return structuredClone({
			id: this.id,
			title: this.title,
			revision: this.revision,
			blocks: this.blocks,
			comments: this.comments,
			access: this.access,
			drive: this.drive,
			source: this.source,
			layout: this.layout,
			updatedAt: this.updatedAt
		});
	}
}

export function createBlock(tag = "p", html = "") {
	return normalizeDocumentBlock({ id: crypto.randomUUID(), tag, html }) || {
		id: crypto.randomUUID(),
		tag: "p",
		html: ""
	};
}

function normalizeBlocks(blocks) {
	const used = new Set();
	const normalized = [];
	for (const candidate of Array.isArray(blocks) ? blocks : []) {
		const block = normalizeDocumentBlock(candidate);
		if (!block) continue;
		if (used.has(block.id)) block.id = crypto.randomUUID();
		used.add(block.id);
		normalized.push(block);
	}
	return normalized.length ? normalized : [createBlock("p", "Start writing…")];
}

function normalizeAccess(access) {
	return access && typeof access === "object"
		? structuredClone(access)
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
