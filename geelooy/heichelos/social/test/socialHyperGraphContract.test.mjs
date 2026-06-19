// B"H
/**
 * Chapter 110: The hyper-social graph is struck by exact endpoint fire.
 * Questions, answers, verse scans, source scans, references, copied posts,
 * remixes, audio manifests, waveforms, slideshows, nested series, comments,
 * iframe apps, and code app manifests are each independently verified.
 */
import { strict as assert } from 'node:assert';
import { createSocialApi } from '../api/index.js';
import { copyPostToSeries, createPost, createSeries } from '../model/socialObjectGraph.js';

const calls = [];
const api = createSocialApi({ base: '/api/social', fetcher: mockFetch });
const question = createPost({
    id: 'question one',
    kind: 'question',
    title: 'What is the first light?',
    sections: [
        { kind: 'verse', text: 'In the beginning', verseRef: 'Genesis 1:1' },
        { kind: 'question', text: 'How does this become social?' }
    ],
    attachments: [
        { kind: 'audio', src: '/audio/light.mp3', cues: [{ at: 1.2, sectionId: 'section_1' }] },
        { kind: 'slideshow', frames: [{ src: '/img/1.png' }, { src: '/img/2.png' }] },
        { kind: 'iframe', src: '/os/app/light' }
    ],
    references: [{ kind: 'cites', toId: 'source one' }],
    comments: [{ kind: 'comment', body: 'open it', replies: [{ kind: 'reply', body: 'opened' }] }]
});
const series = createSeries({ id: 'series one', title: 'Root', postIds: [question.id], subseriesIds: ['series two'] });
const copied = copyPostToSeries(question, series.id, 'alias one');

assert.equal(question.kind, 'question');
assert.equal(question.sections[0].verseRef, 'Genesis 1:1');
assert.equal(question.attachments[1].frames.length, 2);
assert.equal(question.comments[0].replies[0].kind, 'reply');
assert.equal(series.subseriesIds[0], 'series two');
assert.equal(copied.copiedFrom.postId, 'question one');

await api.sections.verseScan('post 1', { range: '1-3' });
await api.sections.sourceScan('post 1', { lang: 'he' });
await api.references.graphForPost('post 1');
await api.references.copyToSeries('post 1', { seriesId: 'series a' });
await api.references.remixToSeries('post 1', { seriesId: 'series b' });
await api.media.attachments('post 1');
await api.media.addAttachment('post 1', { kind: 'audio', src: '/a.mp3' });
await api.media.audioManifest('aud 1');
await api.media.waveform('aud 1');
await api.media.slideshowManifest('show 1');
await api.series.create({ title: 'root' });
await api.series.addPost('series 1', { postId: 'post 1' });
await api.series.addSubseries('series 1', { seriesId: 'series 2' });
await api.series.reorder('series 1', { ids: ['post 1'] });
await api.qa.ask({ title: 'why' });
await api.qa.answer('question 1', { postId: 'answer 1' });
await api.qa.answersForQuestion('question 1');
await api.qa.answerComments('answer 1');
await api.embeds.iframeApp({ src: '/os/app' });
await api.embeds.codeAppManifest({ name: 'mini' });

assertCall(0, 'GET', '/api/social/posts/post%201/verse-scan?range=1-3');
assertCall(1, 'GET', '/api/social/posts/post%201/source-scan?lang=he');
assertCall(2, 'GET', '/api/social/posts/post%201/reference-graph');
assertCall(3, 'POST', '/api/social/posts/post%201/copy-to-series', { seriesId: 'series a' });
assertCall(4, 'POST', '/api/social/posts/post%201/remix-to-series', { seriesId: 'series b' });
assertCall(5, 'GET', '/api/social/posts/post%201/attachments');
assertCall(6, 'POST', '/api/social/posts/post%201/attachments', { kind: 'audio', src: '/a.mp3' });
assertCall(7, 'GET', '/api/social/media/aud%201/audio-manifest');
assertCall(8, 'GET', '/api/social/media/aud%201/waveform');
assertCall(9, 'GET', '/api/social/media/show%201/slideshow-manifest');
assertCall(10, 'POST', '/api/social/series', { title: 'root' });
assertCall(11, 'POST', '/api/social/series/series%201/posts', { postId: 'post 1' });
assertCall(12, 'POST', '/api/social/series/series%201/subseries', { seriesId: 'series 2' });
assertCall(13, 'POST', '/api/social/series/series%201/reorder', { ids: ['post 1'] });
assertCall(14, 'POST', '/api/social/questions', { title: 'why' });
assertCall(15, 'POST', '/api/social/questions/question%201/answers', { postId: 'answer 1' });
assertCall(16, 'GET', '/api/social/questions/question%201/answers');
assertCall(17, 'GET', '/api/social/answers/answer%201/comments');
assertCall(18, 'POST', '/api/social/embeds/iframe-app', { src: '/os/app' });
assertCall(19, 'POST', '/api/social/embeds/code-app-manifest', { name: 'mini' });

console.log('B"H SOCIAL_HYPER_GRAPH_CONTRACT_PASSED');

function assertCall(index, method, url, body) {
    const call = calls[index];
    assert.equal(call.method, method, 'method ' + index);
    assert.equal(call.url, url, 'url ' + index);
    if (body) assert.deepEqual(JSON.parse(call.body), body, 'body ' + index);
}

async function mockFetch(url, options = {}) {
    calls.push({ url, method: options.method || 'GET', body: options.body || '' });
    return { ok: true, status: 200, statusText: 'OK', text: async () => JSON.stringify({ ok: true, data: { url }, error: null }) };
}
