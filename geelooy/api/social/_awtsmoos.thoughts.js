// B"H
/**
 * @module ThoughtRoutes
 * @description
 * Chapter 528: Thought Streams now have memory, edit, reaction, measure, and
 * recursive withdrawal, still entirely additive under `/api/social`.
 */
const { er } = require('./helper/general.js');
const {
  createThought, updateThought, deleteThought, listThoughts, threadThought,
  feedThoughts, thoughtStats, setReaction, getReactions
} = require('./helper/thoughts.js');

function method($i, allowed) {
  return allowed.includes($i.request.method) ? null : er({ code: 'BAD_METHOD', message: `Use ${allowed.join(' or ')}.` });
}

function body($i) {
  for (const value of [$i.$_POST, $i.$_PUT, $i.$_PATCH]) {
    if (value && Object.keys(value).length) return value;
  }
  return {};
}
function truthy(value) { return ['1', 'true', 'yes', true].includes(value); }

module.exports = ({ $i } = {}) => ({
  '/thoughts/feed': async () => {
    const bad = method($i, ['GET']);
    if (bad) return bad;
    return feedThoughts({ $i, aliasId: $i.$_GET.aliasId || '', heichelId: $i.$_GET.heichelId || '', limit: $i.$_GET.limit || 80 });
  },

  '/thoughts/thread/:thoughtId': async vars => {
    const bad = method($i, ['GET']);
    if (bad) return bad;
    return threadThought({ $i, thoughtId: vars.thoughtId });
  },

  '/thoughts/:thoughtId/reactions': async vars => {
    if ($i.request.method === 'GET') return getReactions({ $i, thoughtId: vars.thoughtId });
    if ($i.request.method === 'POST') return setReaction({ $i, thoughtId: vars.thoughtId, input: body($i) });
    return er({ code: 'BAD_METHOD', message: 'Use GET or POST.' });
  },

  '/thoughts/:thoughtId/replies': async vars => {
    const bad = method($i, ['POST']);
    if (bad) return bad;
    const parent = await threadThought({ $i, thoughtId: vars.thoughtId });
    if (!parent.success) return parent;
    return createThought({ $i, parentId: vars.thoughtId, entityType: parent.success.entityType, entityId: parent.success.entityId, input: body($i) });
  },

  '/thoughts/:entityType/:entityId/stats': async vars => {
    const bad = method($i, ['GET']);
    if (bad) return bad;
    return thoughtStats({ $i, entityType: vars.entityType, entityId: vars.entityId });
  },

  '/thoughts/:thoughtId': async vars => {
    if ($i.request.method === 'PUT') return updateThought({ $i, thoughtId: vars.thoughtId, input: body($i) });
    if ($i.request.method === 'DELETE') return deleteThought({ $i, thoughtId: vars.thoughtId, recursive: truthy($i.$_GET.recursive) });
    return er({ code: 'BAD_METHOD', message: 'Use PUT or DELETE.' });
  },

  '/thoughts/:entityType/:entityId': async vars => {
    if ($i.request.method === 'GET') return listThoughts({ $i, entityType: vars.entityType, entityId: vars.entityId, limit: $i.$_GET.limit || 80 });
    if ($i.request.method === 'POST') return createThought({ $i, entityType: vars.entityType, entityId: vars.entityId, input: body($i) });
    return er({ code: 'BAD_METHOD', message: 'Use GET or POST.' });
  }
});
