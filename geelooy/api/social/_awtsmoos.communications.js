// B"H
/**
 * @module SocialCommunicationRoutes
 * @description
 * Chapter 539: The communication bridge now grows an Inbox OS. These are
 * additive `/api/social` routes; old mail, notification, profile, and live
 * routes remain in their own chambers.
 */
const { er } = require('./helper/general.js');
const {
  communicationOverview, notificationDigest, liveMap, listInbox, getThread,
  countUnread, recordInboxItem, markInboxItemRead, markThreadRead
} = require('./helper/communications.js');

function getOnly($i) {
  return $i.request.method === 'GET' ? null : er({ code: 'BAD_METHOD', message: 'Use GET.' });
}

function postOnly($i) {
  return $i.request.method === 'POST' ? null : er({ code: 'BAD_METHOD', message: 'Use POST.' });
}

function body($i) {
  for (const value of [$i.$_POST, $i.$_PUT, $i.$_PATCH]) {
    if (value && Object.keys(value).length) return value;
  }
  return {};
}

module.exports = ({ $i, userid } = {}) => ({
  '/communications/:alias/overview': async vars => {
    const bad = getOnly($i); if (bad) return bad;
    return communicationOverview({ $i, userid, aliasId: vars.alias });
  },

  '/communications/:alias/live-map': async vars => {
    const bad = getOnly($i); if (bad) return bad;
    return { success: liveMap({ aliasId: vars.alias }) };
  },

  '/communications/:alias/notification-digest': async vars => {
    const bad = getOnly($i); if (bad) return bad;
    return notificationDigest({ $i, aliasId: vars.alias, limit: $i.$_GET?.limit || 10 });
  },

  '/communications/:alias/inbox': async vars => {
    if ($i.request.method === 'GET') return listInbox({ $i, aliasId: vars.alias, limit: $i.$_GET?.limit || 50 });
    if ($i.request.method === 'POST') return recordInboxItem({ $i, aliasId: vars.alias, item: body($i) });
    return er({ code: 'BAD_METHOD', message: 'Use GET or POST.' });
  },

  '/communications/:alias/inbox/unread': async vars => {
    const bad = getOnly($i); if (bad) return bad;
    return countUnread({ $i, aliasId: vars.alias });
  },

  '/communications/:alias/inbox/:item/read': async vars => {
    const bad = postOnly($i); if (bad) return bad;
    return markInboxItemRead({ $i, aliasId: vars.alias, itemId: vars.item });
  },

  '/communications/:alias/threads/:thread': async vars => {
    const bad = getOnly($i); if (bad) return bad;
    return getThread({ $i, aliasId: vars.alias, threadId: vars.thread, limit: $i.$_GET?.limit || 100 });
  },

  '/communications/:alias/threads/:thread/read': async vars => {
    const bad = postOnly($i); if (bad) return bad;
    return markThreadRead({ $i, aliasId: vars.alias, threadId: vars.thread });
  }
});
