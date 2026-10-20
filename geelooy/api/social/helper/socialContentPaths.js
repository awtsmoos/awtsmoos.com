//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module socialContent
 * @description
 * Chapter 454: The helper no longer turns broken JSON into silence.
 *
 * Posts, questions, answers, sections, reposts, and shares remain one entity
 * river, but malformed structured fields now stop at the riverbank instead of
 * becoming empty arrays. This closes the stress-discovered gap where
 * `sections={not-json` looked successful.
 */

const { sp } = require('./_awtsmoos.constants.js');

function contentPath({ heichelId, postId }) { return `${sp}/heichelos/${heichelId}/posts/${postId}`; }
function contentRecordPath({ heichelId, postId }) { return `${contentPath({ heichelId, postId })}.awtsmoosJSON`; }
function sectionsPath({ heichelId, postId }) { return `${contentPath({ heichelId, postId })}/sections`; }
function sectionPath({ heichelId, postId, sectionId }) { return `${sectionsPath({ heichelId, postId })}/${sectionId}`; }
function entityAliasPath(entity) { return `${sp}/aliases/${entity.aliasId}/entities/${entity.type}/${entity.id}`; }
function questionAnswerIndex({ heichelId, questionId, answerId }) { return `${sp}/heichelos/${heichelId}/questions/${questionId}/answers/${answerId}`; }
function contentEntity({ heichelId, seriesId, postId, type = 'post', aliasId }) { return { type, id: postId, heichelId, seriesId, aliasId }; }
function sectionEntity({ heichelId, seriesId, postId, sectionId, aliasId }) { return { type: 'section', id: sectionId, heichelId, seriesId, parentId: postId, sectionId, aliasId }; }

function parseSections(value, field = 'sections') {
    if (value === undefined || value === null || value === '') return [];
    if (Array.isArray(value)) return value;
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : { error: { code: 'BAD_SECTIONS', message: `${field} must be a JSON array.` } };
    } catch (error) {
        return { error: { code: 'BAD_SECTIONS_JSON', message: `${field} must be valid JSON.`, details: String(error.message || error) } };
    }
}

function badParsed(...items) { return items.find(item => item && item.error); }

module.exports = {
	contentPath,
	contentRecordPath,
	sectionsPath,
	sectionPath,
	entityAliasPath,
	questionAnswerIndex,
	contentEntity,
	sectionEntity,
	parseSections,
	badParsed
};
