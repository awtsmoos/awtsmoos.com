// B"H
/**
 * @module RichCommentPaths
 * @description
 * Chapter 148: A comment cannot be both scroll and chamber in DosDB. So every
 * comment id gets a folder, with `data` for the comment and `children` for its
 * replies. The vessel is stable and safe for infinite branching.
 */

const { sp } = require('../_awtsmoos.constants.js');

function postRoot({ heichelId, postId }) {
  return `${sp}/heichelos/${heichelId}/posts/${postId}/commentTree`;
}

function commentsRoot(context) { return `${postRoot(context)}/comments`; }
function commentFolder(context) { return `${commentsRoot(context)}/${context.commentId}`; }
function commentPath(context) { return `${commentFolder(context)}/data`; }
function rootChildrenPath(context) { return `${postRoot(context)}/roots`; }
function childIndexPath(context) { return `${commentFolder(context)}/children`; }
function verseIndexPath(context) { return `${postRoot(context)}/byVerse/${context.verseSection || 'root'}`; }
function subsectionIndexPath(context) { return `${postRoot(context)}/bySubsection/${context.subsectionId || 'root'}`; }
function uniquePath(context) { return `${sp}/commentUrls/${context.commentId}`; }

module.exports = { postRoot, commentsRoot, commentFolder, commentPath, rootChildrenPath, childIndexPath, verseIndexPath, subsectionIndexPath, uniquePath };
