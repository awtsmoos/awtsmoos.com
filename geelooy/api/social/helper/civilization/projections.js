// B"H
/**
 * @module CivilizationProjections
 * @description Chapter 548: events are one river, but the OS needs windows.
 * This module projects targetable events into the existing Inbox OS bridge.
 */

const { recordInboxItem } = require('../communicationInbox/index.js');

function aliasesFor(event) {
  const out = new Set(event.targetAliases || []);
  if (event.target?.aliasId) out.add(event.target.aliasId);
  if (event.target?.type === 'alias' && event.target.id) out.add(event.target.id);
  return [...out].filter(Boolean);
}
function titleOf(event) { return event.payload?.title || event.context?.title || event.type; }
function bodyOf(event) { return event.payload?.body || event.payload?.text || event.payload?.summary || ''; }
function actionUrl(event) {
  if (event.payload?.actionUrl) return event.payload.actionUrl;
  if (event.target?.type && event.target?.id) return `/social#${encodeURIComponent(event.target.type)}:${encodeURIComponent(event.target.id)}`;
  return '/social';
}

async function projectEvent({ $i, event }) {
  const projected = [];
  for (const aliasId of aliasesFor(event)) {
    const item = await recordInboxItem({ $i, aliasId, item: {
      id: `civ_${event.id}`, threadId: event.context?.threadId || event.target?.id || event.type,
      kind: event.type, title: titleOf(event), body: bodyOf(event), fromAliasId: event.actor?.id,
      entityType: event.target?.type, entityId: event.target?.id, actionUrl: actionUrl(event), createdAt: event.createdAt
    } });
    if (item.success) projected.push({ aliasId, itemId: item.success.id });
  }
  return projected;
}

function feedForAlias({ events = [], aliasId }) {
  return events.filter(event => aliasesFor(event).includes(aliasId) || event.actor?.id === aliasId)
    .map(event => ({ ...event, feedReason: event.actor?.id === aliasId ? 'actor' : 'target' }));
}

module.exports = { projectEvent, feedForAlias, aliasesFor };
