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
    // B"H 2026-11-20 (composer publish cluster, defect 1): a userId must
    // never be accepted as a publishing aliasId. On accounts whose userId
    // collides with an alias id, a stale client identity silently
    // published posts under the userId while the UI showed the chosen
    // public alias. Reject loudly at this single creation funnel (content
    // routes, editor publish, review-approval canonical creation) instead
    // of silently publishing under the wrong identity. Session-less
    // internal writes are unaffected.
    const sessionUserId = String($i?.request?.user?.info?.userId || $i?.request?.user?.info?.userid || $i?.request?.user?.userId || $i?.request?.user?.userid || '').trim();
    if (sessionUserId && entity.aliasId === sessionUserId) return er({ code: 'ALIAS_ID_IS_USER_ID', message: 'A user ID cannot publish as an alias. Choose a public alias and publish again.' });
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
