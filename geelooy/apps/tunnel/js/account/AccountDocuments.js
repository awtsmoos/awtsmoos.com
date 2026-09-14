// B"H
// Boruch Hashem
// Blessed is He

import { accountFetch, accountJson } from "./AccountFetch.js";
import { escapeHtml, fileName, titleFromPath } from "./AccountDocumentText.js";

/**
 * @file Gives the browser tunnel complete Awtsmoos Docs persistence through Drive.
 * @description The Awtsmoos renews document, source, path, and editor together;
 * Awtsmoos.com writes the exact AWTDOC schema used by Docs so agent-created files
 * remain ordinary private documents rather than becoming a separate automation silo.
 */

/** Lists Drive entries in a folder so callers can discover AWTDOC documents. */
export function accountDocumentsList(input = {}) {
	const alias = segment(input.aliasId, "aliasId");
	const query = new URLSearchParams({
		path: input.path || "Documents",
		limit: String(Math.min(250, Math.max(1, Number(input.limit) || 100)))
	});
	if (input.cursor) query.set("cursor", String(input.cursor));
	return accountFetch(`/api/social/drive/${alias}/entries?${query}`);
}

/** Reads one stored document, including its exact serialized content. */
export function accountDocumentGet(input = {}) {
	const alias = segment(input.aliasId, "aliasId");
	const path = drivePath(input.path || input.fileName);
	return accountFetch(`/api/social/drive/${alias}/entry/${path}?content=true`);
}

/** Creates or replaces a private AWTDOC file using the canonical Docs schema. */
export function accountDocumentSave(input = {}) {
	const alias = segment(input.aliasId, "aliasId");
	const logicalPath = documentPath(input);
	const path = drivePath(logicalPath);
	return accountJson(`/api/social/drive/${alias}/entry/${path}`, {
		content: JSON.stringify(documentEnvelope(input, logicalPath), null, "\t"),
		mime: "application/x-awtsmoos-document+json",
		visibility: input.visibility === "public" ? "public" : "private"
	}, "PUT");
}

/** Deletes one document through the same Drive ownership and scope checks as Docs. */
export function accountDocumentDelete(input = {}) {
	const alias = segment(input.aliasId, "aliasId");
	const path = drivePath(input.path || input.fileName);
	return accountFetch(`/api/social/drive/${alias}/entry/${path}`, {
		method: "DELETE"
	});
}

function documentEnvelope(input, logicalPath) {
	const title = String(input.title || titleFromPath(logicalPath)).slice(0, 160);
	const now = new Date().toISOString();
	return {
		schemaVersion: 1,
		editorVersion: "1.0",
		document: {
			id: String(input.documentId || crypto.randomUUID()),
			title,
			revision: Number.isSafeInteger(input.revision) ? input.revision : 0,
			blocks: documentBlocks(input),
			comments: Array.isArray(input.comments) ? input.comments : [],
			semanticObjects: Array.isArray(input.semanticObjects) ? input.semanticObjects : [],
			access: { mode: input.visibility === "public" ? "public" : "private" },
			drive: { aliasId: String(input.aliasId), path: logicalPath },
			source: { format: "awtdoc", fileName: fileName(logicalPath), path: logicalPath },
			layout: input.layout && typeof input.layout === "object" ? input.layout : {},
			updatedAt: now
		}
	};
}

function documentBlocks(input) {
	if (Array.isArray(input.blocks) && input.blocks.length) {
		return input.blocks.map(block => ({
			id: String(block.id || crypto.randomUUID()),
			tag: String(block.tag || "p"),
			html: String(block.html || ""),
			style: block.style && typeof block.style === "object" ? block.style : {}
		}));
	}
	return [{ id: crypto.randomUUID(), tag: "p", html: escapeHtml(input.content || ""), style: {} }];
}

function documentPath(input) {
	const explicit = String(input.path || "").replace(/^\/+/, "");
	if (explicit.endsWith(".awtdoc")) return explicit;
	const folder = explicit || String(input.folder || "Documents").replace(/^\/+|\/+$/g, "");
	const name = String(input.fileName || `${input.title || "Untitled document"}.awtdoc`);
	return `${folder}/${name.endsWith(".awtdoc") ? name : `${name}.awtdoc`}`;
}

function drivePath(value) {
	const text = String(value || "").replace(/^\/+/, "");
	if (!text) throw new Error("account_document_path_required");
	return text.split("/").filter(Boolean).map(encodeURIComponent).join("/");
}

function segment(value, field) {
	const text = String(value || "").trim();
	if (!text) throw new Error(`account_${field}_required`);
	return encodeURIComponent(text);
}
