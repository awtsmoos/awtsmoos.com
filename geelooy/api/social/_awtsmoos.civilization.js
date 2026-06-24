// B"H
/**
 * @module SocialCivilizationRoutes
 * @description Chapter 551: canonical `/api/social/civilization/*` routes where
 * every object can speak as an event and every projection can become a view.
 */

const { er } = require('./helper/general.js');
const civ = require('./helper/civilization/index.js');

function method($i, expected) {
  return $i.request.method === expected ? null : er({ code: 'BAD_METHOD', message: `Use ${expected}.` });
}
function input($i) { return { ...($i.$_GET || {}), ...($i.$_POST || {}) }; }
function json(value, fallback = {}) {
  if (!value) return fallback;
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch { return fallback; }
}
function query($i) {
  const body = input($i);
  return { type: body.type || '', actorAliasId: body.actorAliasId || '', targetAliasId: body.targetAliasId || '', targetType: body.targetType || '', targetId: body.targetId || '', since: body.since || 0 };
}

module.exports = ({ $i } = {}) => ({
  '/civilization/events': async () => {
    if ($i.request.method === 'POST') return await civ.recordCivilizationEvent({ $i, input: { ...($i.$_POST || {}), actor: json($i.$_POST?.actor), target: json($i.$_POST?.target), payload: json($i.$_POST?.payload), context: json($i.$_POST?.context), targetAliases: json($i.$_POST?.targetAliases, []) } });
    if ($i.request.method === 'GET') return civ.listCivilizationEvents({ $i, query: query($i), limit: Number($i.$_GET?.limit || 100) });
    return er({ code: 'BAD_METHOD', message: 'Use GET or POST.' });
  },
  '/civilization/feed/:alias': async vars => {
    const bad = method($i, 'GET'); if (bad) return bad;
    return civ.civilizationFeed({ $i, aliasId: vars.alias, limit: Number($i.$_GET?.limit || 100) });
  },
  '/civilization/entities/:type/:id/state': async vars => {
    const bad = method($i, 'GET'); if (bad) return bad;
    return await civ.civilizationEntityState({ $i, type: vars.type, id: vars.id });
  },
  '/civilization/subscriptions/:alias': async vars => {
    if ($i.request.method === 'POST') return civ.subscribeCivilization({ $i, aliasId: vars.alias, subject: $i.$_POST?.subject || 'all', options: json($i.$_POST?.options) });
    if ($i.request.method === 'GET') return civ.listCivilizationSubscriptions({ $i, aliasId: vars.alias });
    return er({ code: 'BAD_METHOD', message: 'Use GET or POST.' });
  },
  '/civilization/state': async () => {
    const bad = method($i, 'GET'); if (bad) return bad;
    return civ.getCivilizationState({ $i });
  }
});
