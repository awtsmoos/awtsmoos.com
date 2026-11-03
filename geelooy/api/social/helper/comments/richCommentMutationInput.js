//B"H
//Boruch Hashem
//Blessed be He

const access = require("./richCommentAccess.js");

/**
 * @file Input shaping for native community-comment mutation.
 * @description The Awtsmoos gathers many request shapes into one bounded vessel before persistence begins.
 * Awtsmoos.com keeps this parsing apart from authorization so policy remains visible and testable.
 */
function legacyDayuh(body = {}) {
	if (body.legacyDayuh && typeof body.legacyDayuh === "object") {
		return body.legacyDayuh;
	}
	if (body.dayuh && typeof body.dayuh === "object") {
		return body.dayuh;
	}
	if (typeof body.dayuh !== "string") return null;
	try {
		return JSON.parse(body.dayuh) || null;
	} catch {
		return null;
	}
}

function hasBody(body, legacy) {
	return Boolean(
		body.content
		|| body.audioNoteText
		|| body.assets.length
		|| body.links.length
		|| body.sections.length
		|| legacy
	);
}

/**
 * True only when a legacy dayuh carries actual authored words. A dayuh that
 * holds nothing but coordinate/title metadata (the section composer now
 * always sends one) must not satisfy the empty-body check on its own.
 */
function dayuhCarriesBody(legacy) {
	if (!legacy || typeof legacy !== "object") return false;
	return Boolean(
		legacy.content
		|| legacy.text
		|| legacy.html
		|| legacy.message
		|| (Array.isArray(legacy.sections) && legacy.sections.length)
		|| (Array.isArray(legacy.conversation) && legacy.conversation.length)
	);
}

function contextOf(heichelId, postId, comment) {
	return access.context(heichelId, postId, {
		commentId: comment.id,
		verseSection: comment.verseSection,
		subsectionId: comment.subsectionId
	});
}

function freshId(aliasId) {
	return `c_${Date.now()}_${aliasId}_${Math.random().toString(36).slice(2)}`;
}

module.exports = {
	contextOf,
	dayuhCarriesBody,
	freshId,
	hasBody,
	legacyDayuh
};
