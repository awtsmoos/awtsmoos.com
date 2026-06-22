//B"H
/**
 * @module socialContent
 * @description
 * Chapter 454: The helper no longer turns broken JSON into silence.
 *
 * Posts, questions, answers, sections, reposts, and shares remain one entity
 * river, but malformed structured fields now stop at the riverbank instead of
 * becoming empty arrays. This closes the stress-discovered gap where
 * `sections={not-json` looked successful.
 */

const { sp } = require('./_awtsmoos.constants.js');
const { er } = require('./general.js');
const { addGraphReference, listGraphReferences, resolveEntity } = require('./socialGraph.js');
const { mirrorPost } = require('./packed/socialPacked.js');
const { normalizeEntity, entityPathId } = require('./entities/entitySchema.js');

function contentPath({ heichelId, postId }) { return `${sp}/heichelos/${heichelId}/posts/${postId}`; }
function contentRecordPath({ heichelId, postId }) { return `${contentPath({ heichelId, postId })}.awtsmoosJSON`; }
function sectionsPath({ heichelId, postId }) { return `${contentPath({ heichelId, postId })}/sections`; }
function sectionPath({ heichelId, postId, sectionId }) { return `${sectionsPath({ heichelId, postId })}/${sectionId}`; }
function entityAliasPath(entity) { return `${sp}/aliases/${entity.aliasId}/entities/${entity.type}/${entity.id}`; }
function questionAnswerIndex({ heichelId, questionId, answerId }) { return `${sp}/heichelos/${heichelId}/questions/${questionId}/answers/${answerId}`; }
function contentEntity({ heichelId, seriesId, postId, type = 'post', aliasId }) { return { type, id: postId, heichelId, seriesId, aliasId }; }
function sectionEntity({ heichelId, seriesId, postId, sectionId, aliasId }) { return { type: 'section', id: sectionId, heichelId, seriesId, parentId: postId, sectionId, aliasId }; }

function parseSections(value, field = 'sections') {
    if (value === undefined || value === null || value === '') return [];
    if (Array.isArray(value)) return value;
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : { error: { code: 'BAD_SECTIONS', message: `${field} must be a JSON array.` } };
    } catch (error) {
        return { error: { code: 'BAD_SECTIONS_JSON', message: `${field} must be valid JSON.`, details: String(error.message || error) } };
    }
}

function badParsed(...items) { return items.find(item => item && item.error); }

async function readPostRecord({ $i, heichelId, postId }) {
    const explicit = await $i.db.get(contentRecordPath({ heichelId, postId }), { max: true }).catch(() => null);
    if (explicit && typeof explicit === 'object' && !Buffer.isBuffer(explicit) && !Array.isArray(explicit)) return explicit;
    const fallback = await $i.db.get(contentPath({ heichelId, postId }), { max: true }).catch(() => null);
    return fallback && typeof fallback === 'object' && !Buffer.isBuffer(fallback) && !Array.isArray(fallback) ? fallback : null;
}

async function writeSectionChildren({ $i, heichelId, postId, aliasId, seriesId, sections }) {
    for (const section of sections) await $i.db.write(sectionPath({ heichelId, postId, sectionId: section.id }), { ...section, postId, heichelId, seriesId, aliasId, entity: sectionEntity({ heichelId, seriesId, postId, sectionId: section.id, aliasId }) });
}

async function connectEntityIndexes({ $i, entity }) {
    await $i.db.write(`${sp}/heichelos/${entity.heichelId}/postIds/${entity.id}`, true);
    await $i.db.write(`${sp}/heichelos/${entity.heichelId}/series/${entity.seriesId}/posts/${entity.id}`, true);
    await $i.db.write(`${sp}/aliases/${entity.aliasId}/postsSubmitted/inHeichel/${entity.heichelId}/inSeries/${entity.seriesId}/${entity.id}`, true);
    await $i.db.write(`${sp}/aliases/${entity.aliasId}/heichelosContributedTo/${entity.heichelId}`, true);
    await $i.db.write(entityAliasPath(entity), { heichelId: entity.heichelId, seriesId: entity.seriesId, id: entity.id, type: entity.type, updatedAt: Date.now() });
    await $i.db.write(questionAnswerIndex({ heichelId: entity.heichelId, questionId: entity.parentQuestionId || entity.id, answerId: entity.id }), entity.type === 'answer');
}

function recordFromEntity(entity) {
    return {
        id: entity.id,
        postId: entity.id,
        title: entity.title,
        content: entity.rootContent,
        rootContent: entity.rootContent,
        rootAssets: entity.rootAssets,
        aliasId: entity.aliasId,
        author: entity.aliasId,
        heichelId: entity.heichelId,
        seriesId: entity.seriesId,
        parentSeriesId: entity.seriesId,
        contentType: entity.type,
        entityType: entity.type,
        entityMode: entity.mode,
        parentQuestionId: entity.parentQuestionId,
        commentsEnabled: entity.commentsEnabled,
        sections: entity.sections,
        verseMap: Object.fromEntries(entity.sections.map(section => [section.verseSection, section.id])),
        options: entity.options,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt
    };
}

async function createEntityRecord({ $i, input }) {
    if (input.sections?.error) return er(input.sections.error);
    if (input.rootAssets?.error) return er(input.rootAssets.error);
    const entity = normalizeEntity(input);
    entity.id = entityPathId(entity);
    if (!entity.heichelId || !entity.aliasId || !entity.title) return er({ code: 'MISSING_PARAMS', message: 'heichelId, aliasId and title are required.' });
    if (entity.type === 'answer' && !entity.parentQuestionId) return er({ code: 'ANSWER_WITHOUT_QUESTION', message: 'Answers require parentQuestionId or questionId.' });
    const record = recordFromEntity(entity);
    await $i.db.write(contentRecordPath({ heichelId: entity.heichelId, postId: entity.id }), record);
    await connectEntityIndexes({ $i, entity });
    await writeSectionChildren({ $i, heichelId: entity.heichelId, postId: entity.id, aliasId: entity.aliasId, seriesId: entity.seriesId, sections: entity.sections });
    await resolveEntity({ $i, entity: contentEntity({ heichelId: entity.heichelId, seriesId: entity.seriesId, postId: entity.id, type: entity.type, aliasId: entity.aliasId }) });
    if (entity.type === 'answer') await addGraphReference({ $i, kind: 'answers', aliasId: entity.aliasId, from: contentEntity({ heichelId: entity.heichelId, seriesId: entity.seriesId, postId: entity.id, type: 'answer', aliasId: entity.aliasId }), to: contentEntity({ heichelId: entity.heichelId, seriesId: entity.seriesId, postId: entity.parentQuestionId, type: 'question' }), excerpt: entity.rootContent.slice(0, 240) });
    mirrorPost({ $i, post: record });
    return { success: record };
}

async function createContentRecord({ $i, heichelId, seriesId = 'root', postId, aliasId, type = 'post', title, content = '', sections = [], rootAssets = [], parentQuestionId = '', mode = '' }) {
    return await createEntityRecord({ $i, input: { id: postId, heichelId, seriesId, aliasId, type, title, content, sections, rootAssets, parentQuestionId, mode } });
}
async function createPost({ $i, heichelId }) {
    const sections = parseSections($i.$_POST.sections || $i.$_POST.verses, 'sections');
    const rootAssets = parseSections($i.$_POST.rootAssets || $i.$_POST.assets, 'assets');
    const bad = badParsed(sections, rootAssets); if (bad) return er(bad.error);
    return await createEntityRecord({ $i, input: { ...$i.$_POST, heichelId, type: $i.$_POST.type || 'post', sections, rootAssets } });
}
async function createQuestion({ $i, heichelId }) {
    const sections = parseSections($i.$_POST.sections || $i.$_POST.verses, 'sections');
    const rootAssets = parseSections($i.$_POST.rootAssets || $i.$_POST.assets, 'assets');
    const bad = badParsed(sections, rootAssets); if (bad) return er(bad.error);
    return await createEntityRecord({ $i, input: { ...$i.$_POST, heichelId, type: 'question', sections, rootAssets } });
}
async function createAnswer({ $i, heichelId, questionId }) {
    const sections = parseSections($i.$_POST.sections || $i.$_POST.verses, 'sections');
    const rootAssets = parseSections($i.$_POST.rootAssets || $i.$_POST.assets, 'assets');
    const bad = badParsed(sections, rootAssets); if (bad) return er(bad.error);
    return await createEntityRecord({ $i, input: { ...$i.$_POST, heichelId, type: 'answer', parentQuestionId: questionId, sections, rootAssets } });
}

async function listAnswers({ $i, heichelId, questionId, seriesId = 'root' }) { return await listGraphReferences({ $i, entity: contentEntity({ heichelId, seriesId, postId: questionId, type: 'question' }), direction: 'inbound', kind: 'answers' }); }
async function createSection({ $i, heichelId, postId }) {
    const post = await readPostRecord({ $i, heichelId, postId });
    if (!post) return er({ code: 'POST_NOT_FOUND', message: 'Cannot add section to missing entity.' });
    const assets = parseSections($i.$_POST.assets, 'assets');
    const segments = parseSections($i.$_POST.segments, 'segments');
    const bad = badParsed(assets, segments); if (bad) return er(bad.error);
    const section = normalizeEntity({ heichelId, aliasId: $i.$_POST.aliasId || post.aliasId, title: post.title, mode: 'structured', sections: [{ id: $i.$_POST.sectionId, title: $i.$_POST.title, content: $i.$_POST.content, html: $i.$_POST.html, verseSection: $i.$_POST.verseSection, segmentType: $i.$_POST.segmentType, assets, segments }] }).sections[0];
    const updated = { ...post, entityMode: 'structured', sections: [...(Array.isArray(post.sections) ? post.sections : []), section] };
    updated.verseMap = Object.fromEntries(updated.sections.map(s => [s.verseSection, s.id]));
    updated.updatedAt = Date.now();
    await $i.db.write(contentRecordPath({ heichelId, postId }), updated);
    await writeSectionChildren({ $i, heichelId, postId, aliasId: $i.$_POST.aliasId || post.aliasId, seriesId: post.seriesId || 'root', sections: [section] });
    mirrorPost({ $i, post: updated });
    return { success: { ...section, postId, heichelId, seriesId: post.seriesId || 'root', aliasId: $i.$_POST.aliasId || post.aliasId } };
}
async function listSections({ $i, heichelId, postId }) {
    const post = await readPostRecord({ $i, heichelId, postId });
    if (post && Array.isArray(post.sections)) return { success: post.sections };
    const sections = await $i.db.get(sectionsPath({ heichelId, postId }), { max: true }).catch(() => null);
    if (!sections || typeof sections !== 'object') return { success: [] };
    const results = [];
    for (const id of Object.keys(sections)) {
        const value = await $i.db.get(sectionPath({ heichelId, postId, sectionId: id }), { max: true }).catch(() => null);
        if (value && typeof value === 'object' && !Buffer.isBuffer(value)) results.push(value);
    }
    return { success: results };
}

function entityFromBody(body, prefix) { return { type: body[`${prefix}Type`], id: body[`${prefix}Id`], heichelId: body[`${prefix}HeichelId`], seriesId: body[`${prefix}SeriesId`], parentId: body[`${prefix}ParentId`], sectionId: body[`${prefix}SectionId`], aliasId: body[`${prefix}AliasId`] }; }
async function createRepost({ $i }) { return await addGraphReference({ $i, from: entityFromBody($i.$_POST, 'from'), to: entityFromBody($i.$_POST, 'to'), kind: $i.$_POST.kind || 'reposts', aliasId: $i.$_POST.aliasId, excerpt: $i.$_POST.excerpt, note: $i.$_POST.note }); }

module.exports = { createPost, createQuestion, createAnswer, listAnswers, createSection, listSections, createRepost, createContentRecord, readPostRecord, contentRecordPath, contentPath };
