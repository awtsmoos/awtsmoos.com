// B"H
/**
 * Chapter 112: The wrappers are no longer praised for spelling paths.
 * They must survive real social life: users creating, editing, deleting,
 * answering, replying, copying, remixing, attaching, scanning, and being denied.
 */
import { strict as assert } from 'node:assert';
import { createSocialApi } from '../api/index.js';
import { createInMemorySocialRuntime } from './inMemorySocialRuntime.mjs';

const runtime = createInMemorySocialRuntime();
let currentUser = 'alice';
const api = createSocialApi({ base: '/api/social', fetcher });

const users = ['alice', 'bob', 'carol', 'dina'];
const kinds = ['essay', 'question', 'verse', 'caption', 'media', 'app', 'citation', 'remix'];
const created = [];

for (let index = 0; index < kinds.length; index++) {
    created.push(await as(users[index % users.length], () => must(api.client.post('/posts', {
        kind: kinds[index],
        title: `stress ${kinds[index]} ${index}`,
        body: `body ${index} with light and source scan material`
    }))));
}

const alicePost = created[0];
const bobPost = created[1];
const aliceSection = await as('alice', () => must(api.sections.create(alicePost.id, { kind: 'verse', text: 'Genesis light verse section' })));
await as('alice', () => must(api.sections.update(aliceSection.id, { text: 'Genesis light verse section edited' })));
const quoteSection = await as('alice', () => must(api.sections.create(alicePost.id, { kind: 'quote', text: 'source quote scan section' })));
const verseScan = await must(api.sections.verseScan(alicePost.id, {}));
const sourceScan = await must(api.sections.sourceScan(alicePost.id, {}));
assert.ok(verseScan.some(section => section.id === aliceSection.id));
assert.ok(sourceScan.some(section => section.id === quoteSection.id));

await as('bob', () => mustFail(api.client.put(`/posts/${alicePost.id}`, { title: 'stolen' }), 403));
await as('alice', () => must(api.client.put(`/posts/${alicePost.id}`, { title: 'owned edit survived' })));
assert.equal((await must(api.client.get(`/posts/${alicePost.id}`))).title, 'owned edit survived');

const reference = await as('alice', () => must(api.references.create(alicePost.id, { kind: 'cites', toId: bobPost.id, label: 'stress citation' })));
const graph = await must(api.references.graphForPost(alicePost.id));
assert.equal(graph.length, 1);

const audio = await as('alice', () => must(api.media.addAttachment(alicePost.id, { kind: 'audio', src: '/stress.mp3', cues: [{ at: 1, sectionId: aliceSection.id }] })));
const slideshow = await as('alice', () => must(api.media.addAttachment(alicePost.id, { kind: 'slideshow', frames: [{ src: '/1.png' }, { src: '/2.png' }] })));
assert.equal((await must(api.media.audioManifest(audio.id))).cues.length, 1);
assert.ok((await must(api.media.waveform(audio.id))).samples.length > 3);
assert.equal((await must(api.media.slideshowManifest(slideshow.id))).frames.length, 2);

const rootSeries = await as('alice', () => must(api.series.create({ title: 'Root stress series' })));
const childSeries = await as('alice', () => must(api.series.create({ title: 'Child stress series' })));
await as('alice', () => must(api.series.addPost(rootSeries.id, { postId: alicePost.id })));
await as('alice', () => must(api.series.addSubseries(rootSeries.id, { seriesId: childSeries.id })));
await as('alice', () => must(api.series.reorder(rootSeries.id, { ids: [bobPost.id, alicePost.id] })));
assert.deepEqual((await must(api.series.get(rootSeries.id))).postIds, [bobPost.id, alicePost.id]);

const copied = await as('carol', () => must(api.references.copyToSeries(alicePost.id, { seriesId: rootSeries.id })));
const remixed = await as('dina', () => must(api.references.remixToSeries(alicePost.id, { seriesId: rootSeries.id })));
assert.equal(copied.copiedFrom.postId, alicePost.id);
assert.equal(remixed.copiedFrom.kind, 'remix');

const question = await as('bob', () => must(api.qa.ask({ title: 'How does stress become light?', body: 'question body' })));
const answerPost = await as('alice', () => must(api.client.post('/posts', { kind: 'answer', title: 'Answer vessel', body: 'answer body' })));
await as('alice', () => must(api.qa.answer(question.id, { postId: answerPost.id })));
assert.equal((await must(api.qa.answersForQuestion(question.id)))[0].id, answerPost.id);

const comment = await as('bob', () => must(api.client.post(`/posts/${alicePost.id}/comments`, { kind: 'comment', body: 'first comment' })));
const reply = await as('alice', () => must(api.client.post(`/comments/${comment.id}/replies`, { kind: 'reply', body: 'reply body' })));
await as('bob', () => must(api.client.put(`/comments/${comment.id}`, { body: 'edited comment' })));
await as('carol', () => mustFail(api.client.delete(`/comments/${comment.id}`), 403));
await as('alice', () => must(api.client.delete(`/comments/${reply.id}`)));
assert.equal((await must(api.client.get(`/comments/${comment.id}/replies`))).length, 0);

await as('bob', () => mustFail(api.client.delete(`/posts/${alicePost.id}`), 403));
await as('alice', () => must(api.sections.remove(quoteSection.id)));
await mustFail(api.sections.get(quoteSection.id), 404);
await as('alice', () => must(api.media.removeAttachment(audio.id)));
await mustFail(api.media.audioManifest(audio.id), 404);
await must(api.references.remove(reference.id));

for (let i = 0; i < 40; i++) {
    const owner = users[i % users.length];
    const stranger = users[(i + 1) % users.length];
    const post = await as(owner, () => must(api.client.post('/posts', { kind: kinds[i % kinds.length], title: `loop ${i}`, body: `loop body ${i}` })));
    await as(owner, () => must(api.client.put(`/posts/${post.id}`, { body: `owner edit ${i}` })));
    await as(owner, () => must(api.sections.create(post.id, { kind: i % 2 ? 'paragraph' : 'verse', text: `section ${i} Genesis source` })));
    await as(owner, () => must(api.media.addAttachment(post.id, { kind: i % 2 ? 'image' : 'audio', src: `/asset-${i}` })));
    await as(stranger, () => must(api.client.post(`/posts/${post.id}/comments`, { body: `stranger comment ${i}` })));
    await as(stranger, () => mustFail(api.client.put(`/posts/${post.id}`, { title: 'bad edit' }), 403));
    if (i % 5 === 0) await as(owner, () => must(api.client.delete(`/posts/${post.id}`)));
}

assert.ok(runtime.db.posts.size >= 35, 'posts survived stress');
assert.ok(runtime.db.sections.size >= 35, 'sections survived stress');
assert.ok(runtime.db.comments.size >= 40, 'comments survived stress');
assert.ok(runtime.db.media.size >= 39, 'media survived stress');

console.log('B"H SOCIAL_REAL_API_STRESS_PASSED', JSON.stringify({
    posts: runtime.db.posts.size,
    sections: runtime.db.sections.size,
    comments: runtime.db.comments.size,
    media: runtime.db.media.size,
    refs: runtime.db.refs.size,
    series: runtime.db.series.size
}));

async function as(user, fn) {
    const previous = currentUser;
    currentUser = user;
    try { return await fn(); } finally { currentUser = previous; }
}

async function must(promise) {
    const result = await promise;
    assert.equal(result.ok, true, result.error || 'expected ok');
    return result.data;
}

async function mustFail(promise, status) {
    const result = await promise;
    assert.equal(result.ok, false, 'expected failure');
    if (status) assert.equal(result.meta.status, status);
    return result;
}

function fetcher(url, options = {}) {
    return runtime.fetcher(url, { ...options, headers: { ...(options.headers || {}), 'x-user': currentUser } });
}
