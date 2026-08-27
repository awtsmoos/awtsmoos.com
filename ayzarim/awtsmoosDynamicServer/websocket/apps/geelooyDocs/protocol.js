// B"H
// Boruch Hashem
// Blessed is He

const { normalizeBlockStyle } = require("./blockStylePolicy.js");
const { normalizeDocumentLayout } = require("./documentLayoutPolicy.js");
const { invalidInput } = require("./docsErrors.js");
const { EVENTS, TYPES } = require("./messageTypes.js");

/**
 * @file Declares the version-one Awtsmoos Docs realtime validation covenant.
 * @description The Awtsmoos is beyond every finite message; Awtsmoos.com gives each
 * collaborative act a bounded vessel and stable validation error so malformed light
 * is refused predictably rather than collapsing into an anonymous internal failure.
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
	"p", "h1", "h2", "h3", "h4", "h5", "h6",
	"blockquote", "pre", "ul", "ol", "table", "hr"
]);

/** Normalizes bounded request text and reports the offending field on overflow. */
function boundedText(value, label, maximum, fallback = "") {
	const text = String(value ?? fallback).trim();
	if (text.length > maximum) {
		throw invalidInput(label, `${label} is too long.`, { maximum });
	}
	return text;
}

/** Validates one rich semantic block before it can enter collaborative document state. */
function documentBlock(value) {
	if (!value || typeof value !== "object") {
		throw invalidInput("block", "Document block is required.");
	}
	const id = boundedText(value.id, "Block id", 96);
	const tag = boundedText(value.tag, "Block tag", 24).toLowerCase();
	const html = String(value.html || "");
	if (!id || !BLOCK_TAGS.has(tag)) {
		throw invalidInput("block", "Unsupported document block.", { tag });
	}
	if (html.length > 120000) {
		throw invalidInput("block.html", "Document block is too large.", { maximum: 120000 });
	}
	if (unsafeMarkup(html)) {
		throw invalidInput("block.html", "Unsafe document markup was rejected.");
	}
	return {
		id,
		tag,
		html,
		style: normalizeBlockStyle(value.style)
	};
}

/** Normalizes page-layout metadata through the shared bounded layout policy. */
function documentLayout(value) {
	return normalizeDocumentLayout(value);
}

/** Validates the finite sharing modes exposed by the current Docs access contract. */
function shareMode(value) {
	const mode = String(value || "private");
	if (!SHARE_MODES.includes(mode)) {
		throw invalidInput("mode", "Unsupported sharing mode.", { mode });
	}
	return mode;
}

/** Validates opaque document identity without revealing repository structure. */
function documentId(value) {
	const id = boundedText(value, "Document id", 96);
	if (!/^[A-Za-z0-9_-]{12,96}$/.test(id)) {
		throw invalidInput("documentId", "Invalid document id.");
	}
	return id;
}

/** Rejects executable or active markup while permitting bounded semantic inline HTML. */
function unsafeMarkup(html) {
	return /<\/?(?:script|style|iframe|object|svg|math)\b/i.test(html)
		|| /\son[a-z]+\s*=/i.test(html)
		|| /javascript\s*:/i.test(html);
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
