// B"H
/**
 * Chapter 15: sidebar comments are API-driven and reader-preserving.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const sidebar = readFileSync('geelooy/heichelos/heichel/modules/ui/sidebar-comments.js', 'utf8');
const grids = readFileSync('geelooy/heichelos/heichel/modules/ui/render/grids.js', 'utf8');
const route = readFileSync('geelooy/api/social/helper/comments/routes/post.js', 'utf8');

assert.match(sidebar, /listCommentAuthors/, 'sidebar must use comment authors API');
assert.match(sidebar, /listCommentsByAlias/, 'sidebar must use alias comments API');
assert.match(sidebar, /Comments could not be loaded/, 'sidebar must show safe failure state');
assert.match(grids, /renderSidebarComments/, 'card menu must wire sidebar comments');
assert.match(grids, /Show Comments/, 'post menu must expose comments action');
assert.match(route, /function seriesFrom\(source = \{\}\)/, 'post route must provide root fallback series');
assert.match(route, /return source\.seriesId \|\| source\.series \|\| "root"/, 'root fallback must be explicit');
console.log('B"H sidebarCommentsContract.test passed');
