//B"H
/**
 * @module socialContent
 * @description
 * First-class Quora-like vessels on top of the Awtsmoos social graph:
 * questions, answers, reposts, shares, references and section anchors.
 */

const { sp } = require('./_awtsmoos.constants.js');
const { er } = require('./general.js');
const { addGraphReference, listGraphReferences, resolveEntity } = require('./socialGraph.js');
const { mirrorPost } = require('./packed/socialPacked.js');

const CONTENT_TYPES = ['post', 'question', 'answer'];

function clean(value, fallback = '') {
    return String(value || fallback).trim();
}

function contentPath({ heichelId, postId }) {
    return `${sp}/heichelos/${heichelId}/posts/${postId}`;
}

function sectionsPath({ heichelId, postId }) {
    return `${contentPath({ heichelId, postId })}/sections`;
}

function sectionPath({ heichelId, postId, sectionId }) {
    return `${sectionsPath({ heichelId, postId })}/${sectionId}`;
}

function contentEntity({ heichelId, seriesId, postId, type = 'post', aliasId }) {
    return {
        type,
        id: postId,
        heichelId,
        seriesId,
        aliasId
    };
}

function sectionEntity({ heichelId, seriesId, postId, sectionId, aliasId }) {
    return {
        type: 'section',
        id: sectionId,
        heichelId,
        seriesId,
        parentId: postId,
        sectionId,
        aliasId
    };
}

function normalizeContentType(value) {
    const type = clean(value || 'post').toLowerCase();
    return CONTENT_TYPES.includes(type) ? type : 'post';
}

async function createContentRecord({ $i, heichelId, seriesId = 'root', postId, aliasId, type = 'post', title, content = '', sections = [] }) {
    const contentType = normalizeContentType(type);
    const id = clean(postId || $i.$_POST?.postId || `BH_content_${Date.now()}`);
    if (!heichelId || !id || !aliasId || !title) {
        return er({ code: 'MISSING_PARAMS', message: 'heichelId, postId, aliasId and title are required.' });
    }

    const record = {
        id,
        postId: id,
        title: clean(title),
        content: clean(content),
        aliasId,
        author: aliasId,
        heichelId,
        seriesId,
        parentSeriesId: seriesId,
        contentType,
        sections: Array.isArray(sections) ? sections.map((section, index) => ({
            ...section,
            id: clean(section.id || `section_${index + 1}`),
            title: clean(section.title || `Section ${index + 1}`),
            content: clean(section.content || section.text || '')
        })) : [],
        createdAt: Date.now(),
        updatedAt: Date.now()
    };

    await $i.db.write(contentPath({ heichelId, postId: id }), record);
    for (const section of record.sections) {
        await $i.db.write(sectionPath({ heichelId, postId: id, sectionId: section.id }), {
            ...section,
            postId: id,
            heichelId,
            seriesId,
            aliasId,
            entity: sectionEntity({ heichelId, seriesId, postId: id, sectionId: section.id, aliasId })
        });
    }

    await resolveEntity({ $i, entity: contentEntity({ heichelId, seriesId, postId: id, type: contentType, aliasId }) });
    mirrorPost({ $i, post: record });
    return { success: record };
}

async function createQuestion({ $i, heichelId }) {
    return await createContentRecord({
        $i,
        heichelId,
        seriesId: $i.$_POST.seriesId || 'root',
        postId: $i.$_POST.postId,
        aliasId: $i.$_POST.aliasId,
        type: 'question',
        title: $i.$_POST.title,
        content: $i.$_POST.content,
        sections: parseSections($i.$_POST.sections)
    });
}

async function createAnswer({ $i, heichelId, questionId }) {
    const answer = await createContentRecord({
        $i,
        heichelId,
        seriesId: $i.$_POST.seriesId || 'root',
        postId: $i.$_POST.answerId || $i.$_POST.postId,
        aliasId: $i.$_POST.aliasId,
        type: 'answer',
        title: $i.$_POST.title || `Answer to ${questionId}`,
        content: $i.$_POST.content,
        sections: parseSections($i.$_POST.sections)
    });
    if (!answer.success) return answer;

    await addGraphReference({
        $i,
        kind: 'answers',
        aliasId: $i.$_POST.aliasId,
        from: contentEntity({ heichelId, seriesId: answer.success.seriesId, postId: answer.success.id, type: 'answer', aliasId: $i.$_POST.aliasId }),
        to: contentEntity({ heichelId, seriesId: $i.$_POST.questionSeriesId || 'root', postId: questionId, type: 'question' }),
        excerpt: answer.success.content.slice(0, 240)
    });
    return answer;
}

async function listAnswers({ $i, heichelId, questionId, seriesId = 'root' }) {
    return await listGraphReferences({
        $i,
        entity: contentEntity({ heichelId, seriesId, postId: questionId, type: 'question' }),
        direction: 'inbound',
        kind: 'answers'
    });
}

async function createSection({ $i, heichelId, postId }) {
    const sectionId = clean($i.$_POST.sectionId || `section_${Date.now()}`);
    if (!sectionId) return er({ code: 'MISSING_SECTION', message: 'sectionId is required.' });
    const post = await $i.db.get(contentPath({ heichelId, postId })).catch(() => null);
    if (!post) return er({ code: 'POST_NOT_FOUND', message: 'Cannot add section to missing post.' });
    const section = {
        id: sectionId,
        title: clean($i.$_POST.title || sectionId),
        content: clean($i.$_POST.content),
        postId,
        heichelId,
        seriesId: post.seriesId || post.parentSeriesId || 'root',
        aliasId: $i.$_POST.aliasId || post.aliasId,
        entity: sectionEntity({ heichelId, seriesId: post.seriesId || post.parentSeriesId || 'root', postId, sectionId, aliasId: $i.$_POST.aliasId || post.aliasId })
    };
    await $i.db.write(sectionPath({ heichelId, postId, sectionId }), section);
    return { success: section };
}

async function listSections({ $i, heichelId, postId }) {
    const sections = await $i.db.get(sectionsPath({ heichelId, postId })).catch(() => null);
    return { success: sections && typeof sections === 'object' ? Object.values(sections) : [] };
}

async function createRepost({ $i }) {
    const from = entityFromBody($i.$_POST, 'from');
    const to = entityFromBody($i.$_POST, 'to');
    return await addGraphReference({
        $i,
        from,
        to,
        kind: $i.$_POST.kind || 'reposts',
        aliasId: $i.$_POST.aliasId,
        excerpt: $i.$_POST.excerpt,
        note: $i.$_POST.note
    });
}

function entityFromBody(body, prefix) {
    return {
        type: body[`${prefix}Type`],
        id: body[`${prefix}Id`],
        heichelId: body[`${prefix}HeichelId`],
        seriesId: body[`${prefix}SeriesId`],
        parentId: body[`${prefix}ParentId`],
        sectionId: body[`${prefix}SectionId`],
        aliasId: body[`${prefix}AliasId`]
    };
}

function parseSections(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

module.exports = {
    CONTENT_TYPES,
    createContentRecord,
    createQuestion,
    createAnswer,
    listAnswers,
    createSection,
    listSections,
    createRepost,
    contentEntity,
    sectionEntity
};
