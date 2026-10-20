//B"H
//Blessed is He
//Boruch Hashem


/**
 * Creates posts, questions, answers, sections and reposts.
 * Split sibling of socialContent.js (verbatim relocation).
 */

const { er } = require('./general.js');
const { addGraphReference, listGraphReferences } = require('./socialGraph.js');
const { mirrorPost } = require('./packed/socialPacked.js');
const { normalizeEntity } = require('./entities/entitySchema.js');
var { parseSections, badParsed, contentEntity, contentRecordPath, sectionsPath, sectionPath } = require('./socialContentPaths.js');
var { readPostRecord, writeSectionChildren } = require('./socialContentRecord.js');
var { createEntityRecord } = require('./socialContentCreate.js');

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

module.exports = {
	createPost,
	createQuestion,
	createAnswer,
	listAnswers,
	createSection,
	listSections,
	createRepost
};
