// B"H
/**
 * Chapter 15: sidebar comments are API-driven, modular, and reader-preserving.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const sidebar = readFileSync('geelooy/heichelos/heichel/modules/ui/sidebar-comments.js', 'utf8');
const menu = readFileSync('geelooy/heichelos/heichel/modules/ui/render/living-path/card-menu-actions.js', 'utf8');
const readOps = readFileSync('geelooy/api/social/helper/comments/routes/postReadOperations.js', 'utf8');

assert.match(sidebar, /listCommentAuthors/, 'sidebar must use comment authors API');
assert.match(sidebar, /listCommentsByAlias/, 'sidebar must use alias comments API');
assert.match(sidebar, /Comments could not be loaded/, 'sidebar must show safe failure state');
assert.match(menu, /renderSidebarComments/, 'post card menu must wire sidebar comments');
assert.match(menu, /commentsAction/, 'post menu must expose a comments action');
assert.match(menu, /Show comments/i, 'post menu must visibly label the comments action');
assert.match(readOps, /function seriesFrom\(source = \{\}\)/, 'post reads must provide root fallback series');
assert.match(readOps, /return source\.seriesId \|\| source\.series \|\| ['"]root['"]/, 'root fallback must be explicit');
console.log('B"H sidebarCommentsContract.test passed');
