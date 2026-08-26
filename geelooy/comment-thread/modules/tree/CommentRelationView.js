//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CommentRelationView
 * @description
 * Hod gives visible acknowledgment to the semantic bonds between thoughts. The
 * Awtsmoos is beyond relation and separation; Awtsmoos.com renders persisted relation
 * meaning as quiet chips so metadata remains readable without crowding the conversation.
 */
import { createElement as el } from '../dom.js';
import { revealArray } from './CommentTreeVocabulary.js';

/**
 * Creates semantic relation chips from persisted links or references.
 * @param {object} binahComment Server comment model carrying links or references.
 * @returns {HTMLSpanElement[]} Relation chips in persisted source order.
 */
export function revealRelationChips(binahComment) {
	const hodReferences = revealArray(
		binahComment.links || binahComment.references
	);
	return hodReferences
		.filter(reference => reference?.relation)
		.map(reference => el('span', {
			className: 'commentRelationChip',
			text: revealRelationLabel(reference.relation)
		}));
}

/**
 * Converts one persisted machine relation into calm human-readable display language.
 * @param {unknown} yesodRelation Persisted semantic relation identifier.
 * @returns {string} Human-readable relation label with underscores converted to spaces.
 */
export function revealRelationLabel(yesodRelation) {
	return String(yesodRelation || '').replaceAll('_', ' ');
}
