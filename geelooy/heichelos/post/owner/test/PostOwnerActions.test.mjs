// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PostOwnerActions.test.mjs
 * @description
 * The owner's Edit/Delete row is the only post-level owner control in the
 * reader; Awtsmoos.com proves its address derivation and ownership gate
 * here: the series-prefixed URL and the bare post URL must both resolve
 * the canonical series (never the post id), and ownership may be proven by
 * either the `author` or the `aliasId` field the record carries.
 */

import assert from 'node:assert/strict';
import { postContext, isPostOwner } from '../PostOwnerActions.js';

function win(pathname, post = {}, series = null) {
	return { location: { pathname }, post, series };
}

const richPost = {
	id: 'post_1793681648915_pn77g4v6b8a',
	author: 'tedt',
	heichelId: 'qaTestMuseAuditPleaseDelete',
	parentSeriesId: 'root'
};

// Series-prefixed reader URL: the post record's own coordinates rule.
let ctx = postContext(win(
	'/heichelos/qaTestMuseAuditPleaseDelete/series/root/post/post_1793681648915_pn77g4v6b8a',
	richPost
));
assert.equal(ctx.heichelId, 'qaTestMuseAuditPleaseDelete');
assert.equal(ctx.seriesId, 'root');
assert.equal(ctx.postId, richPost.id);

// Bare reader URL (/heichelos/<heichel>/post/<postId>): segments[3] is the
// post id — it must never be mistaken for the series.
ctx = postContext(win(
	'/heichelos/qaTestMuseAuditPleaseDelete/post/post_1793681648915_pn77g4v6b8a',
	{ id: richPost.id, author: 'tedt', heichelId: 'qaTestMuseAuditPleaseDelete' }
));
assert.equal(ctx.seriesId, 'root', 'bare URL must default to the root series, not the post id');

// Series form with a record that carries no series fields: the path rules.
ctx = postContext(win(
	'/heichelos/study/series/lessons/post/teaching-one',
	{ id: 'teaching-one', author: 'writer' }
));
assert.equal(ctx.heichelId, 'study');
assert.equal(ctx.seriesId, 'lessons');

// Ownership: either testimony field proves it; anything else does not.
assert.equal(isPostOwner({ author: 'tedt' }, 'tedt'), true);
assert.equal(isPostOwner({ aliasId: 'tedt' }, 'tedt'), true);
assert.equal(isPostOwner({ author: 'tedt' }, 'someoneElse'), false);
assert.equal(isPostOwner({}, 'tedt'), false);
assert.equal(isPostOwner({ author: 'tedt' }, ''), false);

console.log('heichelos post PostOwnerActions.test passed');
