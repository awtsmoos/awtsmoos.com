//B"H
/**
 * @module socialContent
 * @description
 * The Awtsmoos breathes full social content into Geelooy: posts, questions,
 * answers, verse/segment sections, reposts, shares, and graph links. The post
 * record is written before its section directory, preserving DosDB's old file
 * vessel while still allowing verse children to appear beneath it.
 */

const { sp } = require('./_awtsmoos.constants.js');
const { er } = require('./general.js');
const { addGraphReference, listGraphReferences, resolveEntity } = require('./socialGraph.js');
const { mirrorPost } = require('./packed/socialPacked.js');

const CONTENT_TYPES = ['post', 'question', 'answer'];

function clean(value, fallback = '') {
    return String(value || fallback).trim();
}

function nowId(prefix) {
    return `BH_${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
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
    return { type, id: postId, heichelId, seriesId, aliasId };
}

function sectionEntity({ heichelId, seriesId, postId, sectionId, aliasId }) {
    return { type: 'section', id: sectionId, heichelId, seriesId, parentId: postId, sectionId, aliasId };
}

function normalizeContentType(value) {
    const type = clean(value || 'post').toLowerCase();
    return CONTENT_TYPES.includes(type) ? type : 'post';
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

function normalizeSegment(section, index) {
    const id = clean(section.id || section.sectionId || `verse_${index + 1}`);
    const verseSection = clean(section.verseSection || section.verse || id || `verse_${index + 1}`);
    const segments = Array.isArray(section.segments) ? section.segments : [];
    return {
        ...section,
        id,
        sectionId: id,
        verseSection,
        title: clean(section.title || section.name || `Verse ${index + 1}`),
        content: clean(section.content || section.text || section.html || ''),
        html: clean(section.html || section.content || section.text || ''),
        order: Number.isFinite(Number(section.order)) ? Number(section.order) : index,
        segmentType: clean(section.segmentType || 'verse'),
        segments: segments.map((segment, segmentIndex) => ({
            id: clean(segment.id || `segment_${index + 1}_${segmentIndex + 1}`),
            label: clean(segment.label || `Segment ${segmentIndex + 1}`),
            content: clean(segment.content || segment.text || segment.html || ''),
            html: clean(segment.html || segment.content || segment.text || ''),
            order: Number.isFinite(Number(segment.order)) ? Number(segment.order) : segmentIndex
        }))
    };
}

async function writeSectionChildren({ $i, heichelId, postId, aliasId, seriesId, sections }) {
    for (const section of sections) {
        await $i.db.write(sectionPath({ heichelId, postId, sectionId: section.id }), {
            ...section,
            postId,
            heichelId,
            seriesId,
            aliasId,
            entity: sectionEntity({ heichelId, seriesId, postId, sectionId: section.id, aliasId })
        });
    }
}

async function createContentRecord({ $i, heichelId, seriesId = 'root', postId, aliasId, type = 'post', title, content = '', sections = [] }) {
    const contentType = normalizeContentType(type);
    const id = clean(postId || $i.$_POST?.postId || nowId(contentType));
    if (!heichelId || !id || !aliasId || !title) {
        return er({ code: 'MISSING_PARAMS', message: 'heichelId, postId, aliasId and title are required.' });
    }
    const normalizedSections = Array.isArray(sections) ? sections.map(normalizeSegment) : [];
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
        sections: normalizedSections,
        verseMap: Object.fromEntries(normalizedSections.map(section => [section.verseSection, section.id])),
        createdAt: Date.now(),
        updatedAt: Date.now()
    };
    await $i.db.write(contentPath({ heichelId, postId: id }), record);
    await $i.db.write(`${sp}/heichelos/${heichelId}/postIds/${id}`, true);
    await writeSectionChildren({ $i, heichelId, postId: id, aliasId, seriesId, sections: normalizedSections });
    await resolveEntity({ $i, entity: contentEntity({ heichelId, seriesId, postId: id, type: contentType, aliasId }) });
    mirrorPost({ $i, post: record });
    return { success: record };
}

async function createPost({ $i, heichelId }) {
    return await createContentRecord({
        $i,
        heichelId,
        seriesId: $i.$_POST.seriesId || $i.$_POST.parentSeriesId || 'root',
        postId: $i.$_POST.postId,
        aliasId: $i.$_POST.aliasId,
        type: 'post',
        title: $i.$_POST.title,
        content: $i.$_POST.content || $i.$_POST.mainContent,
        sections: parseSections($i.$_POST.sections)
    });
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
    return await listGraphReferences({ $i, entity: contentEntity({ heichelId, seriesId, postId: questionId, type: 'question' }), direction: 'inbound', kind: 'answers' });
}

async function createSection({ $i, heichelId, postId }) {
    const post = await $i.db.get(contentPath({ heichelId, postId })).catch(() => null);
    if (!post) return er({ code: 'POST_NOT_FOUND', message: 'Cannot add section to missing post.' });
    const section = normalizeSegment({
        id: $i.$_POST.sectionId,
        title: $i.$_POST.title,
        content: $i.$_POST.content,
        html: $i.$_POST.html,
        verseSection: $i.$_POST.verseSection,
        segmentType: $i.$_POST.segmentType,
        segments: parseSections($i.$_POST.segments)
    }, Array.isArray(post.sections) ? post.sections.length : 0);
    await writeSectionChildren({ $i, heichelId, postId, aliasId: $i.$_POST.aliasId || post.aliasId, seriesId: post.seriesId || 'root', sections: [section] });
    return { success: { ...section, postId, heichelId, seriesId: post.seriesId || 'root', aliasId: $i.$_POST.aliasId || post.aliasId } };
}

async function listSections({ $i, heichelId, postId }) {
    const sections = await $i.db.get(sectionsPath({ heichelId, postId })).catch(() => null);
    if (!sections || typeof sections !== 'object') return { success: [] };
    const ids = Array.isArray(sections) ? sections : Object.keys(sections);
    const results = [];
    for (const id of ids) {
        const value = typeof id === 'string'
            ? await $i.db.get(sectionPath({ heichelId, postId, sectionId: id })).catch(() => null)
            : id;
        if (value && typeof value === 'object') results.push(value);
    }
    return { success: results };
}

function entityFromBody(body, prefix) {
    return { type: body[`${prefix}Type`], id: body[`${prefix}Id`], heichelId: body[`${prefix}HeichelId`], seriesId: body[`${prefix}SeriesId`], parentId: body[`${prefix}ParentId`], sectionId: body[`${prefix}SectionId`], aliasId: body[`${prefix}AliasId`] };
}

async function createRepost({ $i }) {
    return await addGraphReference({ $i, from: entityFromBody($i.$_POST, 'from'), to: entityFromBody($i.$_POST, 'to'), kind: $i.$_POST.kind || 'reposts', aliasId: $i.$_POST.aliasId, excerpt: $i.$_POST.excerpt, note: $i.$_POST.note });
}

module.exports = { CONTENT_TYPES, createContentRecord, createPost, createQuestion, createAnswer, listAnswers, createSection, listSections, createRepost, contentEntity, sectionEntity, parseSections, normalizeSegment };
