// B"H
// Boruch Hashem
// Blessed is He

const { normalizeBlockStyle } = require("./blockStylePolicy.js");
const { normalizeDocumentLayout } = require("./documentLayoutPolicy.js");

/**
 * @file Declares the Geelooy Docs realtime covenant for content, layout, access, and presence.
 * @description The Awtsmoos is beyond every message name, while Awtsmoos.com gives
 * each collaborative act a bounded vessel so rich formatting may travel without malformed light.
 */
const VERSION = 1;
const APPLICATION_ID = "geelooy-docs";
const SHARE_MODES = Object.freeze([
	"private",
	"public-view",
	"link-view",
	"link-edit"
]);
const BLOCK_TAGS = new Set([
	"p",
	"h1",
	"h2",
	"h3",
	"h4",
	"h5",
	"h6",
	"blockquote",
	"pre",
	"ul",
	"ol",
	"table",
	"hr"
]);
const TYPES = Object.freeze({
	CREATE: "docs.document.create",
	JOIN: "docs.document.join",
	LEAVE: "docs.document.leave",
	PATCH: "docs.document.patch",
	TITLE: "docs.document.title",
	LAYOUT: "docs.document.layout",
	COMMENT: "docs.comment.mutate",
	ACCESS: "docs.access.update",
	INVITE: "docs.access.invite",
	PRESENCE: "docs.presence.update"
});
const EVENTS = Object.freeze({
	DOCUMENT: "docs.document.changed",
	COMMENTS: "docs.comments.changed",
	ACCESS: "docs.access.changed",
	PRESENCE: "docs.presence.changed"
});

function boundedText(value, label, maximum, fallback = "") {
	const text = String(value ?? fallback).trim();
	if (text.length > maximum) throw new Error(`${label} is too long`);
	return text;
}

function documentBlock(value) {
	if (!value || typeof value !== "object") {
		throw new Error("Document block is required");
	}
	const id = boundedText(value.id, "Block id", 96);
	const tag = boundedText(value.tag, "Block tag", 24).toLowerCase();
	const html = String(value.html || "");
	if (!id || !BLOCK_TAGS.has(tag)) throw new Error("Unsupported document block");
	if (html.length > 120000) throw new Error("Document block is too large");
	if (/<\/?(?:script|style|iframe|object|svg|math)\b/i.test(html)) {
		throw new Error("Unsafe document markup");
	}
	if (/\son[a-z]+\s*=/i.test(html) || /javascript\s*:/i.test(html)) {
		throw new Error("Unsafe document markup");
	}
	return {
		id,
		tag,
		html,
		style: normalizeBlockStyle(value.style)
	};
}

function documentLayout(value) {
	return normalizeDocumentLayout(value);
}

function shareMode(value) {
	const mode = String(value || "private");
	if (!SHARE_MODES.includes(mode)) throw new Error("Unsupported sharing mode");
	return mode;
}

function documentId(value) {
	const id = boundedText(value, "Document id", 96);
	if (!/^[A-Za-z0-9_-]{12,96}$/.test(id)) throw new Error("Invalid document id");
	return id;
}

module.exports = {
	APPLICATION_ID,
	EVENTS,
	SHARE_MODES,
	TYPES,
	VERSION,
	boundedText,
	documentBlock,
	documentId,
	documentLayout,
	shareMode
};
