//B"H
/**
 * @module ContentCommentGates
 * @description Posts become rooms, comments become fire, replies become sparks.
 */
import assert from 'node:assert/strict';
import { request } from './server.mjs';
import { okResponse, expectError, arrayish, idFrom, containsDeep, logGate } from './assertions.mjs';

export async function runContentGates(ctx) {
  logGate('5 post lifecycle');
  const post = okResponse(await request(`/api/social/heichelos/${ctx.heichelId}/series/${ctx.seriesA}/posts`, { method: 'POST', apiKey: ctx.apiKey, body: { aliasId: ctx.aliasA, title: 'Lifecycle root post', content: 'Created through series posts API.', dayuh: JSON.stringify({ stress: ctx.runId, kind: 'post' }) } }), 'series post create');
  ctx.postId = idFrom(post, 'success.postId');
  assert.ok(ctx.postId, 'series post id should be returned');
  okResponse(await request(`/api/social/heichelos/${ctx.heichelId}/series/${ctx.seriesA}/posts/details`, { apiKey: ctx.apiKey }), 'series posts details');
  okResponse(await request(`/api/social/heichelos/${ctx.heichelId}/series/${ctx.seriesA}/post/${ctx.postId}`, { apiKey: ctx.apiKey }), 'post direct read');
  okResponse(await request(`/api/social/heichelos/${ctx.heichelId}/series/${ctx.seriesA}/post/${ctx.postId}`, { method: 'PUT', apiKey: ctx.apiKey, body: { aliasId: ctx.aliasA, newTitle: 'Lifecycle root post edited', newContent: 'Edited by lifecycle stress.', dayuh: JSON.stringify({ edited: true }) } }), 'post edit');
  const disposable = okResponse(await request(`/api/social/heichelos/${ctx.heichelId}/series/${ctx.seriesA}/posts`, { method: 'POST', apiKey: ctx.apiKey, body: { aliasId: ctx.aliasA, title: 'Disposable post', content: 'Delete me after proof.' } }), 'disposable post create');
  const disposableId = idFrom(disposable, 'success.postId');
  okResponse(await request(`/api/social/heichelos/${ctx.heichelId}/series/${ctx.seriesA}/post/${disposableId}`, { method: 'DELETE', apiKey: ctx.apiKey, body: { aliasId: ctx.aliasA } }), 'post delete');

  logGate('6 question answer section content');
  const q = okResponse(await request(`/api/social/content/heichelos/${ctx.heichelId}/questions`, { method: 'POST', apiKey: ctx.apiKey, body: { aliasId: ctx.aliasA, postId: ctx.questionId, title: 'Lifecycle question?', content: 'Question from lifecycle stress.', seriesId: ctx.seriesA, sections: JSON.stringify([{ id: ctx.sectionId, title: 'Seed section', content: 'Seed section body.' }]) } }), 'question create');
  assert.equal(q.success?.contentType, 'question');
  okResponse(await request(`/api/social/content/heichelos/${ctx.heichelId}/questions/${ctx.questionId}/answers`, { method: 'POST', apiKey: ctx.apiKeyB, body: { aliasId: ctx.aliasB, answerId: ctx.answerId, title: 'Lifecycle answer', content: 'Answer from alias B.', seriesId: ctx.seriesA } }), 'answer create');
  const answers = okResponse(await request(`/api/social/content/heichelos/${ctx.heichelId}/questions/${ctx.questionId}/answers?seriesId=${ctx.seriesA}`, { apiKey: ctx.apiKey }), 'answers read');
  assert.ok(arrayish(answers.success).length >= 1, 'answers should be listed');
  okResponse(await request(`/api/social/content/heichelos/${ctx.heichelId}/posts/${ctx.questionId}/sections`, { method: 'POST', apiKey: ctx.apiKey, body: { aliasId: ctx.aliasA, sectionId: `${ctx.sectionId}_extra`, title: 'Extra section', content: 'Extra section body.' } }), 'section create');
  okResponse(await request('/api/social/content/repost', { method: 'POST', apiKey: ctx.apiKey, body: { aliasId: ctx.aliasA, fromType: 'post', fromId: ctx.postId, fromHeichelId: ctx.heichelId, fromSeriesId: ctx.seriesA, toType: 'question', toId: ctx.questionId, toHeichelId: ctx.heichelId, toSeriesId: ctx.seriesA, excerpt: 'post to question' } }), 'repost create');
  okResponse(await request('/api/social/content/share', { method: 'POST', apiKey: ctx.apiKey, body: { aliasId: ctx.aliasA, fromType: 'section', fromId: `${ctx.sectionId}_extra`, fromHeichelId: ctx.heichelId, fromParentId: ctx.questionId, toType: 'answer', toId: ctx.answerId, toHeichelId: ctx.heichelId, toSeriesId: ctx.seriesA, excerpt: 'section to answer' } }), 'share create');

  logGate('7 comments replies edit delete concurrent');
  const root = okResponse(await request(`/api/social/heichelos/${ctx.heichelId}/post/${ctx.postId}/comments/`, { method: 'POST', apiKey: ctx.apiKey, body: { aliasId: ctx.aliasA, seriesId: ctx.seriesA, content: 'Root lifecycle comment.', dayuh: JSON.stringify({ verseSection: 'root' }) } }), 'root comment');
  ctx.commentId = idFrom(root, 'details.id');
  const reply = okResponse(await request(`/api/social/heichelos/${ctx.heichelId}/comment/${ctx.commentId}`, { method: 'POST', apiKey: ctx.apiKeyB, body: { postId: ctx.postId, seriesId: ctx.seriesA, aliasId: ctx.aliasB, content: 'Reply lifecycle comment.', dayuh: JSON.stringify({ verseSection: 'root' }) } }), 'reply comment');
  ctx.replyId = idFrom(reply, 'details.id');
  okResponse(await request(`/api/social/heichelos/${ctx.heichelId}/comment/${ctx.commentId}?aliasId=${ctx.aliasA}&parentType=post&parentId=${ctx.postId}&seriesId=${ctx.seriesA}&verseSection=root`, { apiKey: ctx.apiKey }), 'comment full context read');
  okResponse(await request(`/api/social/heichelos/${ctx.heichelId}/comment/${ctx.commentId}`, { method: 'PUT', apiKey: ctx.apiKey, body: { aliasId: ctx.aliasA, parentType: 'post', parentId: ctx.postId, seriesId: ctx.seriesA, verseSection: 'root', content: 'Root lifecycle comment edited.' } }), 'comment edit');
  const burst = await Promise.all(Array.from({ length: 6 }, (_, i) => request(`/api/social/heichelos/${ctx.heichelId}/post/${ctx.postId}/comments/?seriesId=${ctx.seriesA}&aliasId=${i % 2 ? ctx.aliasB : ctx.aliasA}&content=Concurrent_${i}`, { method: 'POST', apiKey: i % 2 ? ctx.apiKeyB : ctx.apiKey, body: { seriesId: ctx.seriesA, aliasId: i % 2 ? ctx.aliasB : ctx.aliasA, content: `Concurrent comment ${i}`, dayuh: JSON.stringify({ verseSection: 'root', i }) } })));
  burst.forEach((res, i) => okResponse(res, `concurrent comment ${i}`));
  const authors = okResponse(await request(`/api/social/heichelos/${ctx.heichelId}/post/${ctx.postId}/comments/aliases?seriesId=${ctx.seriesA}&verseSection=root`, { apiKey: ctx.apiKey }), 'comment authors');
  assert.ok(containsDeep(authors, ctx.aliasA), 'comment authors should include alias A');
  okResponse(await request(`/api/social/heichelos/${ctx.heichelId}/comment/${ctx.replyId}`, { method: 'DELETE', apiKey: ctx.apiKeyB, body: { aliasId: ctx.aliasB, parentType: 'comment', parentId: ctx.commentId, postId: ctx.postId, seriesId: ctx.seriesA, verseSection: 'root' } }), 'reply delete');
  expectError(await request(`/api/social/heichelos/${ctx.heichelId}/comments`, { method: 'POST', apiKey: ctx.apiKey, body: { parentType: 'comment', parentId: ctx.commentId, seriesId: ctx.seriesA, aliasId: ctx.aliasA, content: 'bad missing postId' } }), 'bad comment missing postId');
}
