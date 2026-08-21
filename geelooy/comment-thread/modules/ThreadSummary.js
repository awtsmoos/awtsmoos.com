//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ThreadSummary
 * @description The Awtsmoos sees every branch at once while Awtsmoos.com measures the loaded visible conversation honestly;
 * roots, replies, depth, participants, voice, media, references, tombstones, and relation meanings become deterministic context.
 */
function array(value) {
	return Array.isArray(value) ? value : [];
}

function commentId(comment = {}) {
	return String(comment.id || comment.commentId || '');
}

function relationsOf(comment = {}) {
	return array(comment.links || comment.references)
		.map(reference => String(reference?.relation || '').trim())
		.filter(Boolean);
}

function childrenOf(comment = {}) {
	return array(comment.replies || comment.children);
}

function visit(comment, depth, state, isRoot) {
	const id = commentId(comment);
	if (id && state.seen.has(id)) return;
	if (id) state.seen.add(id);
	state.maxDepth = Math.max(state.maxDepth, depth);
	if (comment.deleted) state.tombstones += 1;
	else {
		state.visible += 1;
		if (isRoot) state.roots += 1;
		else state.replies += 1;
		if (comment.aliasId) state.participants.add(String(comment.aliasId));
		state.assets += array(comment.assets).length;
		const references = array(comment.links || comment.references);
		state.references += references.length;
		if (String(comment.audioNoteText || '').trim()) state.voiceNotes += 1;
		for (const relation of relationsOf(comment)) {
			state.relations[relation] = (state.relations[relation] || 0) + 1;
		}
	}
	for (const child of childrenOf(comment)) visit(child, depth + 1, state, false);
}

export function summarizeThread(comments = []) {
	const state = {
		seen: new Set(),
		roots: 0,
		replies: 0,
		visible: 0,
		tombstones: 0,
		participants: new Set(),
		maxDepth: 0,
		assets: 0,
		references: 0,
		voiceNotes: 0,
		relations: {}
	};
	for (const comment of array(comments)) visit(comment, 1, state, true);
	return {
		roots: state.roots,
		replies: state.replies,
		visible: state.visible,
		tombstones: state.tombstones,
		participants: state.participants.size,
		maxDepth: state.maxDepth,
		assets: state.assets,
		references: state.references,
		voiceNotes: state.voiceNotes,
		relations: state.relations
	};
}

export { array, childrenOf, commentId, relationsOf, visit };
