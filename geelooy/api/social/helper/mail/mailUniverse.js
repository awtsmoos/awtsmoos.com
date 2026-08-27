// B"H
/**
 * @module MailUniverse
 * @description
 * Chapter 175: Mail is not merely inbox decoration. A thread can be mirrored as
 * a private entity universe chamber, linked to posts or discussions, then
 * rendered and forked like any other social object while mail CSS remains intact.
 */

const { writeEntity, linkEntities, getEntity } = require('../entityUniverse/universeStore.js');

function threadEntity(thread = {}) {
  return {
    type: 'mailThread',
    id: thread.id || thread.threadId,
    aliasId: thread.aliasId || thread.ownerAlias || '',
    heichelId: thread.heichelId || '',
    seriesId: thread.seriesId || 'mail',
    title: thread.subject || thread.title || 'Mail Thread',
    content: thread.preview || thread.content || '',
    visibility: thread.visibility || 'private',
    nodes: (thread.messages || []).map((message, index) => ({ id: message.id || `message_${index + 1}`, type: 'note', title: message.from || message.aliasId || `Message ${index + 1}`, content: message.body || message.content || '', order: index, children: [] }))
  };
}

async function mirrorMailThread({ $i, thread }) {
  const entity = threadEntity(thread);
  const written = await writeEntity({ $i, input: entity });
  return written.success ? { success: written.success } : written;
}

async function linkMailThreadToEntity({ $i, threadId, target, actorAlias = '' }) {
  const got = await getEntity({ $i, type: 'mailThread', id: threadId });
  if (!got.success) return got;
  return await linkEntities({ $i, from: got.success, to: target, kind: 'derivedFrom', actorAlias, note: 'mail thread linked to public entity' });
}

module.exports = { threadEntity, mirrorMailThread, linkMailThreadToEntity };
