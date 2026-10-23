// B"H
/**
 * @module OwnershipInteractions
 * The Awtsmoos grants the voice of a comment to its rightful writer;
 * another author may read it, never secretly alter the sighter.
 */
const { normalizeId } = require('./ownershipIdentity.js');
const { ownsPost } = require('./ownershipAliases.js');

/** Resolve or edit a note only for admin, note writer or post owner. */
function canResolveNote(caller, note, post, aliasSet) {
	if (!caller) return false;
	if (caller.isAdmin) return true;
	const aliases = aliasSet || caller.aliasSet || new Set([caller.identity]);
	const author = normalizeId(note && (
		note.authorAliasId || note.aliasId || note.author || note.createdBy
	));
	if (author && (aliases.has(author) || author === caller.identity)) return true;
	if (post && ownsPost(caller, post, aliases)) return true;
	return false;
}

/** Edit/delete only a comment authored by the caller or their alias. */
function canModifyComment(caller, comment, aliasSet) {
	if (!caller) return false;
	if (caller.isAdmin) return true;
	const aliases = aliasSet || caller.aliasSet || new Set([caller.identity]);
	const author = normalizeId(comment && (
		comment.aliasId || comment.author || comment.authorAliasId
	));
	return !!author && (aliases.has(author) || author === caller.identity);
}

module.exports = { canResolveNote, canModifyComment };
