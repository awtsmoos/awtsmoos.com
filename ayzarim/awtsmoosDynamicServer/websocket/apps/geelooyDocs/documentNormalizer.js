// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("crypto");
const {
	boundedText,
	documentBlock,
	documentLayout
} = require("./protocol.js");

/**
 * @file Normalizes a client snapshot into the first durable collaborative document.
 * @description The Awtsmoos renews old and new without losing their truth; Awtsmoos.com
 * carries safe blocks, notes, and measured page layout forward instead of erasing local work.
 */
function normalizeDocument(snapshot = {}, id) {
	const rawBlocks = Array.isArray(snapshot.blocks)
		? snapshot.blocks.slice(0, 800)
		: [];
	const blocks = rawBlocks.map(documentBlock);
	if (!blocks.length) {
		blocks.push(documentBlock({
			id: crypto.randomUUID(),
			tag: "p",
			html: "Start writing…"
		}));
	}
	const blockIds = new Set(blocks.map(block => block.id));
	return {
		id,
		title: normalizeTitle(snapshot.title),
		revision: 0,
		blocks,
		layout: documentLayout(snapshot.layout),
		comments: normalizeComments(snapshot.comments, blockIds),
		access: { mode: "private" },
		drive: {},
		updatedAt: new Date().toISOString()
	};
}

function normalizeTitle(value) {
	return boundedText(
		value,
		"Document title",
		160,
		"Untitled document"
	) || "Untitled document";
}

function normalizeComments(comments, blockIds) {
	const result = [];
	const source = Array.isArray(comments)
		? comments.slice(0, 500)
		: [];
	for (const candidate of source) {
		if (!candidate || typeof candidate !== "object") continue;
		const blockId = boundedText(
			candidate.blockId,
			"Comment block id",
			96,
			""
		);
		if (!blockIds.has(blockId)) continue;
		result.push({
			id: boundedText(candidate.id, "Comment id", 96),
			blockId,
			text: boundedText(candidate.text, "Comment", 4000),
			author: boundedText(
				candidate.author,
				"Comment author",
				48,
				"Local author"
			),
			resolved: Boolean(candidate.resolved),
			createdAt: safeDate(candidate.createdAt),
			replies: normalizeReplies(candidate.replies)
		});
	}
	return result;
}

function normalizeReplies(replies) {
	const source = Array.isArray(replies) ? replies.slice(0, 300) : [];
	return source.map(reply => ({
		id: boundedText(reply?.id, "Reply id", 96),
		text: boundedText(reply?.text, "Reply", 4000),
		author: boundedText(
			reply?.author,
			"Reply author",
			48,
			"Local author"
		),
		createdAt: safeDate(reply?.createdAt)
	}));
}

function safeDate(value) {
	const parsed = Date.parse(String(value || ""));
	return Number.isFinite(parsed)
		? new Date(parsed).toISOString()
		: new Date().toISOString();
}

module.exports = {
	normalizeDocument
};
