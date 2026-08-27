//B"H
/**
 * @module commentEvents
 * @description Comment/reply events append to audit shard, not individual files.
 */

const { logicalKey } = require('./shardPaths.js');
const { writePacked } = require('./socialPacked.js');

function appendCommentEvent({ $i, eventType = 'comment.submitted', comment = {}, actor = '' }) {
  const id = comment.commentId || comment.id || `${eventType}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const event = { id, type: eventType, actor, comment, createdAt: Date.now() };
  writePacked({
    $i,
    shard: 'audit',
    key: logicalKey(['comments', 'events', eventType, id]),
    value: event,
    meta: { kind: 'commentEvent', type: eventType }
  });
  return event;
}

module.exports = { appendCommentEvent };
