// B"H
/**
 * @module SocialCommunicationsBridge
 * @description
 * Chapter 538: Mail is river, notifications are bells, profiles are faces,
 * live rooms are breath, and now the Inbox OS is their shared plaza.
 */
const { er } = require('./general.js');
const { pageChannel } = require('./livePresence.js');
const { aggregateProfile } = require('./profile/index.js');
const { listNotifications, countUnreadNotifications } = require('./notifications.js');
const { getUnreadCount, getLatestNotification } = require('./mail.js');
const inbox = require('./communicationInbox/index.js');

function clean(value, fallback = '') {
  return String(value || fallback).trim().replace(/[^a-zA-Z0-9_:@.-]/g, '_').slice(0, 180);
}
function firstSuccess(result, fallback) { return result && result.success ? result.success : fallback; }
function safeError(result, code = 'UNAVAILABLE') {
  const source = result && result.error ? result.error : {};
  return { available: false, code: source.code || code, message: source.message || 'Unavailable.' };
}

async function notificationDigest({ $i, aliasId, limit = 10 }) {
  const alias = clean(aliasId);
  if (!alias) return er({ code: 'MISSING_ALIAS', message: 'alias is required.' });
  const [unread, recent] = await Promise.all([
    countUnreadNotifications({ $i, aliasId: alias }),
    listNotifications({ $i, aliasId: alias, includeRead: true })
  ]);
  return { success: { aliasId: alias, unread: firstSuccess(unread, { count: 0 }).count || 0,
    recent: firstSuccess(recent, []).slice(0, Number(limit || 10)),
    pollUrl: `/api/social/notifications/${alias}/poll`, listUrl: `/api/social/notifications/${alias}?includeRead=true` } };
}

async function mailDigest({ $i, userid, aliasId }) {
  const alias = clean(aliasId);
  const [unread, latest] = await Promise.all([
    getUnreadCount({ $i, userid, aliasId: alias }), getLatestNotification({ $i, userid, aliasId: alias })
  ]);
  if (unread?.error) return safeError(unread, 'MAIL_AUTH_UNAVAILABLE');
  return { available: true, unread: unread?.count || unread?.success?.count || 0,
    latest: latest?.error ? null : latest, inboxUrl: `/api/social/mail/get?aliasId=${encodeURIComponent(alias)}`,
    unreadUrl: `/api/social/mail/unread/count?aliasId=${encodeURIComponent(alias)}` };
}

function liveMap({ aliasId }) {
  const alias = clean(aliasId);
  return { aliasId: alias, profileChannel: pageChannel({ alias }), inboxChannel: pageChannel({ thread: `${alias}:inbox` }),
    notificationChannel: `notifications:${alias}`, chatChannel: `chat:${alias}`,
    websocketEvents: ['SOCIAL_SUBSCRIBED', 'SOCIAL_PRESENCE', 'SOCIAL_EVENT', 'SOCIAL_PONG'] };
}

async function communicationOverview({ $i, userid, aliasId }) {
  const alias = clean(aliasId);
  if (!alias) return er({ code: 'MISSING_ALIAS', message: 'alias is required.' });
  const [profile, notes, mail, inboxCount] = await Promise.all([
    aggregateProfile({ $i, aliasId: alias }).catch(() => null),
    notificationDigest({ $i, aliasId: alias }).catch(error => ({ error })),
    mailDigest({ $i, userid, aliasId: alias }).catch(error => safeError({ error })),
    inbox.countUnread({ $i, aliasId: alias }).catch(() => ({ success: { count: 0 } }))
  ]);
  return { success: { aliasId: alias, profile: profile || null, notifications: firstSuccess(notes, { unread: 0, recent: [] }), mail,
    inbox: { unread: firstSuccess(inboxCount, { count: 0 }).count || 0, url: `/api/social/communications/${alias}/inbox`,
      unreadUrl: `/api/social/communications/${alias}/inbox/unread`, threadUrlTemplate: `/api/social/communications/${alias}/threads/{thread}` },
    live: liveMap({ aliasId: alias }), actions: { profile: `/api/social/profile/${alias}`, notifications: `/api/social/notifications/${alias}`,
      mail: `/api/social/mail/get?aliasId=${encodeURIComponent(alias)}`, chat: `/social?alias=${encodeURIComponent(alias)}#chat` } } };
}

module.exports = { communicationOverview, notificationDigest, liveMap, mailDigest, ...inbox };
