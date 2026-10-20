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

module.exports = {
	readPostRecord,
	writeSectionChildren,
	connectEntityIndexes,
	recordFromEntity
};
