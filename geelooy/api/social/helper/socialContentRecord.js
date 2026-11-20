//B"H
//Blessed is He
//Boruch Hashem


/**
 * Reads and writes stored social content records.
 * Split sibling of socialContent.js (verbatim relocation).
 */

const { sp } = require('./_awtsmoos.constants.js');
var { contentPath, contentRecordPath, sectionPath, entityAliasPath, questionAnswerIndex, sectionEntity } = require('./socialContentPaths.js');

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
    // B"H 2026-11-20 (composer publish cluster, defect 2): the four index
    // writes below used db.write(<child path>, true). DosDB's plain tree
    // silently drops boolean leaf writes (verified live: write returns
    // undefined, the child reads back null), so every post created through
    // this path landed in NO index — the series posts map stayed {},
    // heichel postIds stayed null, and published posts were invisible on
    // the heichel page ("0 teachings"). The established post path
    // (helper/post/indexAddWrite.js) appends into the parent map object
    // instead; do the same here so each entry persists inside its map.
    // Indexes are best-effort (the record itself is the truth): a storage
    // shape surprise on one index must never fail the publication, so
    // each append is isolated and only warns.
    const appendIndex = async (path, entry) => {
        try {
            await $i.db.appendToObj(path, entry);
        } catch (error) {
            console.warn('connectEntityIndexes: index append failed', path, error?.message || error);
        }
    };
    await appendIndex(`${sp}/heichelos/${entity.heichelId}/postIds`, { key: entity.id, value: true });
    await appendIndex(`${sp}/heichelos/${entity.heichelId}/series/${entity.seriesId}/posts`, {
        key: entity.id,
        value: { author: entity.aliasId, aliasId: entity.aliasId, postId: entity.id, title: entity.title, updatedAt: entity.updatedAt || Date.now() }
    });
    await appendIndex(`${sp}/aliases/${entity.aliasId}/postsSubmitted/inHeichel/${entity.heichelId}/inSeries/${entity.seriesId}`, { key: entity.id, value: true });
    await appendIndex(`${sp}/aliases/${entity.aliasId}/heichelosContributedTo`, { key: entity.heichelId, value: true });
    await $i.db.write(entityAliasPath(entity), { heichelId: entity.heichelId, seriesId: entity.seriesId, id: entity.id, type: entity.type, updatedAt: Date.now() });
    if (entity.type === 'answer') {
        await appendIndex(`${sp}/heichelos/${entity.heichelId}/questions/${entity.parentQuestionId}/answers`, {
            key: entity.id,
            value: { answerId: entity.id, aliasId: entity.aliasId, updatedAt: entity.updatedAt || Date.now() }
        });
    }
}

function recordFromEntity(entity) {
    return {
        id: entity.id,
        postId: entity.id,
        title: entity.title,
        content: entity.rootContent,
        rootContent: entity.rootContent,
        rootAssets: entity.rootAssets,
        media: entity.media || null,
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

module.exports = {
	readPostRecord,
	writeSectionChildren,
	connectEntityIndexes,
	recordFromEntity
};
