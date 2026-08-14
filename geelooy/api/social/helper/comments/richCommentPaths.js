// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module RichCommentPaths
 * @description
 * The Awtsmoos gives each modern comment a stable chamber beneath its post.
 * Zero is a real verse/subsection coordinate; only absence becomes `root`.
 */
const { sp } = require('../_awtsmoos.constants.js');

function coordinate(value) {
	return value === '' || value === undefined || value === null ? 'root' : String(value);
}

function postRoot({ heichelId, postId }) {
	return `${sp}/heichelos/${heichelId}/posts/${postId}/commentTree`;
}

function commentsRoot(context) { return `${postRoot(context)}/comments`; }
function commentFolder(context) { return `${commentsRoot(context)}/${context.commentId}`; }
function commentPath(context) { return `${commentFolder(context)}/data`; }
function rootChildrenPath(context) { return `${postRoot(context)}/roots`; }
function childIndexPath(context) { return `${commentFolder(context)}/children`; }
function verseIndexPath(context) { return `${postRoot(context)}/byVerse/${coordinate(context.verseSection)}`; }
function subsectionIndexPath(context) { return `${postRoot(context)}/bySubsection/${coordinate(context.subsectionId)}`; }
function uniquePath(context) { return `${sp}/commentUrls/${context.commentId}`; }

module.exports = {
	childIndexPath,
	commentFolder,
	commentPath,
	commentsRoot,
	coordinate,
	postRoot,
	rootChildrenPath,
	subsectionIndexPath,
	uniquePath,
	verseIndexPath
};
