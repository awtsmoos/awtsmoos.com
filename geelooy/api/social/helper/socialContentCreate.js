//B"H
//Blessed is He
//Boruch Hashem


/**
 * Creates social entity records from normalized input.
 * Split sibling of socialContent.js (verbatim relocation).
 */

const { er } = require('./general.js');
const { addGraphReference, resolveEntity } = require('./socialGraph.js');
const { mirrorPost } = require('./packed/socialPacked.js');
const { normalizeEntity, entityPathId } = require('./entities/entitySchema.js');
var { contentEntity, contentRecordPath } = require('./socialContentPaths.js');
var { recordFromEntity, connectEntityIndexes, writeSectionChildren } = require('./socialContentRecord.js');

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

module.exports = {
	createEntityRecord,
	createContentRecord
};
