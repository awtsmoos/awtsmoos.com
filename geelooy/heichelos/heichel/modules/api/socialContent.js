//B"H
/**
 * @module SocialContentAPI
 * @description Browser API helpers for questions, answers, sections, reposts and shares.
 */

import { AwtsmoosRequest, BASE_API_URL } from './base.js';

export async function createQuestion({ heichelId, aliasId, postId, title, content, seriesId = 'root', sections = [] }) {
    return await AwtsmoosRequest.post(`${BASE_API_URL}content/heichelos/${encodeURIComponent(heichelId)}/questions`, new URLSearchParams({
        aliasId,
        postId,
        title,
        content,
        seriesId,
        sections: JSON.stringify(sections)
    }));
}

export async function createAnswer({ heichelId, questionId, aliasId, answerId, title, content, seriesId = 'root' }) {
    return await AwtsmoosRequest.post(`${BASE_API_URL}content/heichelos/${encodeURIComponent(heichelId)}/questions/${encodeURIComponent(questionId)}/answers`, new URLSearchParams({
        aliasId,
        answerId,
        title,
        content,
        seriesId
    }));
}

export async function listAnswers({ heichelId, questionId }) {
    return await AwtsmoosRequest.fetch(`${BASE_API_URL}content/heichelos/${encodeURIComponent(heichelId)}/questions/${encodeURIComponent(questionId)}/answers`);
}

export async function createSection({ heichelId, postId, aliasId, sectionId, title, content }) {
    return await AwtsmoosRequest.post(`${BASE_API_URL}content/heichelos/${encodeURIComponent(heichelId)}/posts/${encodeURIComponent(postId)}/sections`, new URLSearchParams({
        aliasId,
        sectionId,
        title,
        content
    }));
}

export async function listSections({ heichelId, postId }) {
    return await AwtsmoosRequest.fetch(`${BASE_API_URL}content/heichelos/${encodeURIComponent(heichelId)}/posts/${encodeURIComponent(postId)}/sections`);
}

export async function repostEntity({ aliasId, from, to, note = '', excerpt = '' }) {
    return await graphLink('/content/repost', { aliasId, from, to, note, excerpt, kind: 'reposts' });
}

export async function shareEntity({ aliasId, from, to, note = '', excerpt = '' }) {
    return await graphLink('/content/share', { aliasId, from, to, note, excerpt, kind: 'crossLinks' });
}

export async function referenceEntity({ aliasId, from, to, note = '', excerpt = '' }) {
    return await graphLink('/graph/references', { aliasId, from, to, note, excerpt, kind: 'references' });
}

async function graphLink(path, { aliasId, from, to, note, excerpt, kind }) {
    const body = { aliasId, note, excerpt, kind };
    for (const [prefix, entity] of [['from', from], ['to', to]]) {
        body[`${prefix}Type`] = entity.type;
        body[`${prefix}Id`] = entity.id;
        if (entity.heichelId) body[`${prefix}HeichelId`] = entity.heichelId;
        if (entity.seriesId) body[`${prefix}SeriesId`] = entity.seriesId;
        if (entity.parentId) body[`${prefix}ParentId`] = entity.parentId;
        if (entity.sectionId) body[`${prefix}SectionId`] = entity.sectionId;
        if (entity.aliasId) body[`${prefix}AliasId`] = entity.aliasId;
    }
    return await AwtsmoosRequest.post(`${BASE_API_URL.replace(/\/$/, '')}${path}`, new URLSearchParams(body));
}
