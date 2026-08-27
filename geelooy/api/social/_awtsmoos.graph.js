//B"H
/**
 * Unified graph routes: references, reposts, quotes, answers and cross-links.
 */

const {
    addGraphReference,
    entityFromPost,
    listGraphReferences,
    resolveEntity
} = require('./helper/socialGraph.js');

const { er } = require('./helper/general.js');

function entityFromQuery($i) {
    return {
        type: $i.$_GET?.type,
        id: $i.$_GET?.id,
        heichelId: $i.$_GET?.heichelId,
        seriesId: $i.$_GET?.seriesId,
        parentId: $i.$_GET?.parentId,
        sectionId: $i.$_GET?.sectionId,
        aliasId: $i.$_GET?.aliasId
    };
}

module.exports = ({ $i } = {}) => ({
    "/graph/entity/resolve": async () => {
        if ($i.request.method !== 'GET') return er({ code: 'BAD_METHOD', message: 'Use GET.' });
        return await resolveEntity({ $i, entity: entityFromQuery($i) });
    },

    "/graph/references": async () => {
        if ($i.request.method === 'GET') {
            return await listGraphReferences({
                $i,
                entity: entityFromQuery($i),
                direction: $i.$_GET?.direction || 'outbound',
                kind: $i.$_GET?.kind || 'references'
            });
        }
        if ($i.request.method === 'POST') {
            const payload = { ...($i.$_GET || {}), ...($i.$_POST || {}) };
            const from = entityFromPost(payload, 'from');
            const to = entityFromPost(payload, 'to');
            return await addGraphReference({
                $i,
                from,
                to,
                kind: payload.kind || 'references',
                aliasId: payload.aliasId,
                excerpt: payload.excerpt,
                note: payload.note
            });
        }
        return er({ code: 'BAD_METHOD', message: 'Use GET or POST.' });
    },

    "/graph/reposts": async () => {
        if ($i.request.method === 'GET') {
            return await listGraphReferences({
                $i,
                entity: entityFromQuery($i),
                direction: $i.$_GET?.direction || 'outbound',
                kind: 'reposts'
            });
        }
        if ($i.request.method === 'POST') {
            const payload = { ...($i.$_GET || {}), ...($i.$_POST || {}) };
            const from = entityFromPost(payload, 'from');
            const to = entityFromPost(payload, 'to');
            return await addGraphReference({
                $i,
                from,
                to,
                kind: 'reposts',
                aliasId: payload.aliasId,
                excerpt: payload.excerpt,
                note: payload.note
            });
        }
        return er({ code: 'BAD_METHOD', message: 'Use GET or POST.' });
    }
});
