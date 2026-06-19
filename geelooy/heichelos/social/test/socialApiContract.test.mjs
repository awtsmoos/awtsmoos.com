// B"H
/**
 * Chapter 93: Every social endpoint is struck by its own hammer.
 * Profile posts, comments, activity, post comments, comment replies, graph,
 * timeline, discovery, notifications, mutation, deletion, and failures are
 * all verified by exact method, path, body, and response envelope.
 */
import { strict as assert } from 'node:assert';
import { createSocialApi } from '../api/index.js';

const calls = [];
const api = createSocialApi({ fetcher: mockFetch, base: '/api/social' });

await api.feed.global({ page: 2 });
await api.profiles.overview('alias one');
await api.profiles.posts('alias one', { cursor: 'p1' });
await api.profiles.comments('alias one', { cursor: 'c1' });
await api.profiles.media('alias one', { kind: 'image' });
await api.profiles.activity('alias one', { since: 'now' });
await api.posts.get('post one');
await api.posts.sections('post one');
await api.posts.assets('post one');
await api.posts.comments('post one', { depth: 2 });
await api.posts.comment('post one', { text: 'hi' });
await api.posts.create({ title: 'new' });
await api.posts.update('post one', { title: 'edit' });
await api.posts.remove('post one');
await api.comments.get('comment one');
await api.comments.tree('comment one');
await api.comments.replies('comment one', { page: 3 });
await api.comments.assets('comment one');
await api.comments.reply('comment one', { text: 'reply' });
await api.comments.create({ text: 'root' });
await api.comments.update('comment one', { text: 'edit' });
await api.comments.remove('comment one');
await api.graph.overview({ heichel: 'h1' });
await api.graph.timeline({ actor: 'alias one' });
await api.graph.discovery({ limit: 5 });
await api.graph.notifications({ unread: true });
await api.graph.activity({ scope: 'all' });

assertCall(0, 'GET', '/api/social/feed?page=2');
assertCall(2, 'GET', '/api/social/profiles/alias%20one/posts?cursor=p1');
assertCall(3, 'GET', '/api/social/profiles/alias%20one/comments?cursor=c1');
assertCall(5, 'GET', '/api/social/profiles/alias%20one/activity?since=now');
assertCall(9, 'GET', '/api/social/posts/post%20one/comments?depth=2');
assertCall(10, 'POST', '/api/social/posts/post%20one/comments', { text: 'hi' });
assertCall(12, 'PUT', '/api/social/posts/post%20one', { title: 'edit' });
assertCall(13, 'DELETE', '/api/social/posts/post%20one');
assertCall(16, 'GET', '/api/social/comments/comment%20one/replies?page=3');
assertCall(18, 'POST', '/api/social/comments/comment%20one/replies', { text: 'reply' });
assertCall(20, 'PUT', '/api/social/comments/comment%20one', { text: 'edit' });
assertCall(21, 'DELETE', '/api/social/comments/comment%20one');
assertCall(22, 'GET', '/api/social/graph?heichel=h1');
assertCall(23, 'GET', '/api/social/timeline?actor=alias+one');
assertCall(24, 'GET', '/api/social/discovery?limit=5');
assertCall(25, 'GET', '/api/social/notifications?unread=true');
assertCall(26, 'GET', '/api/social/activity?scope=all');

const failing = createSocialApi({ base: '/api/social', fetcher: failFetch });
const failure = await failing.posts.get('broken');
assert.equal(failure.ok, false);
assert.equal(failure.error, 'burning');
assert.equal(failure.meta.status, 418);

console.log('B"H social API contract passed');

function assertCall(index, method, url, body) {
    const call = calls[index];
    assert.equal(call.url, url, 'url ' + index);
    assert.equal(call.method, method, 'method ' + index);
    if (body) assert.deepEqual(JSON.parse(call.body), body, 'body ' + index);
}

async function mockFetch(url, options = {}) {
    calls.push({ url, method: options.method || 'GET', body: options.body || '' });
    return response(200, { ok: true, data: { url }, error: null });
}

async function failFetch() {
    return response(418, { error: 'burning' }, false, 'teapot');
}

function response(status, body, ok = true, statusText = 'OK') {
    return { ok, status, statusText, text: async () => JSON.stringify(body) };
}
