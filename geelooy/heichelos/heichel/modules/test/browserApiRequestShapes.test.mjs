// B"H
import assert from 'node:assert/strict';
import {
  createQuestion,
  createAnswer,
  listAnswers,
  createSection,
  listSections,
  repostEntity,
  shareEntity,
  referenceEntity
} from '../api/socialContent.js';
import {
  createComment,
  replyToComment,
  listCommentAuthors,
  listCommentsByAlias
} from '../api/comments.js';
import {
  listNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  createNotification,
  pollNotifications,
  fanoutNotifications
} from '../api/notifications.js';
import { semanticSearch } from '../api/semanticSearch.js';

const calls = [];
globalThis.fetch = async (url, opts = {}) => {
  calls.push({ url: String(url), opts });
  return { ok: true, status: 200, statusText: 'OK', async json() { return { success: true }; } };
};

const bodyText = call => call.opts?.body?.toString?.() || '';

await createQuestion({ heichelId: 'h 1', aliasId: 'a', postId: 'q1', title: 'Q', content: 'Body', sections: [{ id: 's1' }] });
await createAnswer({ heichelId: 'h 1', questionId: 'q1', aliasId: 'a', answerId: 'ans1', title: 'A', content: 'Answer' });
await listAnswers({ heichelId: 'h 1', questionId: 'q1' });
await createSection({ heichelId: 'h 1', postId: 'p1', aliasId: 'a', sectionId: 's1', title: 'T', content: 'C' });
await listSections({ heichelId: 'h 1', postId: 'p1' });
await repostEntity({ aliasId: 'a', from: { type: 'post', id: 'p1', heichelId: 'h', seriesId: 'root' }, to: { type: 'question', id: 'q1', sectionId: 's1' }, note: 'n', excerpt: 'e' });
await shareEntity({ aliasId: 'a', from: { type: 'section', id: 's1', parentId: 'p1' }, to: { type: 'answer', id: 'ans1' } });
await referenceEntity({ aliasId: 'a', from: { type: 'alias', id: 'a' }, to: { type: 'post', id: 'p1', heichelId: 'h' }, note: 'ref' });
await createComment({ heichelId: 'h 1', postId: 'p1', aliasId: 'a', seriesId: 's1', content: 'Comment', verseSection: 'v1' });
await replyToComment({ heichelId: 'h 1', postId: 'p1', commentId: 'c1', aliasId: 'a', seriesId: 's1', content: 'Reply' });
await listCommentAuthors({ heichelId: 'h 1', postId: 'p1', seriesId: 's1', verseSection: 'v1' });
await listCommentsByAlias({ heichelId: 'h 1', postId: 'p1', aliasId: 'a', seriesId: 's1', verseSection: 'v1' });
await listNotifications({ aliasId: 'a', includeRead: true });
await getUnreadNotificationCount({ aliasId: 'a' });
await markNotificationRead({ aliasId: 'a', notificationId: 'n1' });
await createNotification({ toAliasId: 'b', fromAliasId: 'a', type: 'reply', title: 'T', body: 'B', entity: { id: 'p1' }, actionUrl: '/x' });
await pollNotifications({ aliasId: 'b', since: 9 });
await fanoutNotifications({ toAliases: ['b', 'c'], fromAliasId: 'a', type: 'storm', title: 'T', body: 'B' });
await semanticSearch({ query: 'deep concept', embedding: '1,2,3', limit: 7, entityType: 'comment' });

assert.ok(calls.some(call => call.url.endsWith('/api/social/content/heichelos/h%201/questions') && call.opts.method === 'POST' && bodyText(call).includes('sections=')));
assert.ok(calls.some(call => call.url.includes('/api/social/content/heichelos/h%201/questions/q1/answers') && call.opts.method === 'POST'));
assert.ok(calls.some(call => call.url.includes('/api/social/content/heichelos/h%201/questions/q1/answers') && !call.opts.method));
assert.ok(calls.some(call => call.url.includes('/api/social/content/heichelos/h%201/posts/p1/sections') && call.opts.method === 'POST'));
assert.ok(calls.some(call => call.url.includes('/api/social/content/heichelos/h%201/posts/p1/sections') && !call.opts.method));
assert.ok(calls.some(call => call.url.endsWith('/api/social/content/repost') && bodyText(call).includes('toSectionId=s1')));
assert.ok(calls.some(call => call.url.endsWith('/api/social/content/share') && bodyText(call).includes('fromParentId=p1')));
assert.ok(calls.some(call => call.url.endsWith('/api/social/graph/references') && bodyText(call).includes('kind=references')));
assert.ok(calls.some(call => call.url.includes('/api/social/heichelos/h%201/post/p1/comments/') && call.opts.method === 'POST' && bodyText(call).includes('verseSection')));
assert.ok(calls.some(call => call.url.includes('/api/social/heichelos/h%201/comment/c1') && call.opts.method === 'POST' && bodyText(call).includes('Reply')));
assert.ok(calls.some(call => call.url.includes('/api/social/heichelos/h%201/post/p1/comments/aliases?') && call.url.includes('verseSection=v1')));
assert.ok(calls.some(call => call.url.includes('/api/social/heichelos/h%201/comments/inSeries/s1/atPost/p1/atAlias/a?') && call.url.includes('verseSection=v1')));
assert.ok(calls.some(call => call.url.includes('/api/social/notifications/a?includeRead=yes')));
assert.ok(calls.some(call => call.url.endsWith('/api/social/notifications/a/unread/count')));
assert.ok(calls.some(call => call.url.endsWith('/api/social/notifications/a/n1/read') && call.opts.method === 'POST'));
assert.ok(calls.some(call => call.url.endsWith('/api/social/notifications/b') && bodyText(call).includes('entity=%7B%22id%22%3A%22p1%22%7D')));
assert.ok(calls.some(call => call.url.includes('/api/social/notifications/b/poll?since=9')));
assert.ok(calls.some(call => call.url.endsWith('/api/social/notifications/fanout') && bodyText(call).includes('toAliases=b%2Cc')));
assert.ok(calls.some(call => call.url.includes('/api/social/search/semantic?') && call.url.includes('entityType=comment') && call.url.includes('limit=7')));

console.log('B"H browserApiRequestShapes.test passed');
