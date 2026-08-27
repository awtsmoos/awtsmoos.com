//B"H
/** Durable notification center routes: dropdown remains, full page/API grows. */
const n = require('./helper/notifications.js');
const { er } = require('./helper/general.js');
function entity(v) { if (!v) return {}; if (typeof v === 'object') return v; try { return JSON.parse(v); } catch { return {}; } }
function aliases(v) { return Array.isArray(v) ? v : String(v || '').split(',').map(x => x.trim()).filter(Boolean); }
function body($i) { return $i.$_POST || $i.$_PUT || $i.$_DELETE || {}; }
module.exports = ({ $i } = {}) => ({
  '/notifications/fanout': async () => $i.request.method === 'POST' ? n.fanoutNotification({ $i, toAliases: aliases(body($i).toAliases), fromAliasId: body($i).fromAliasId, type: body($i).type, title: body($i).title, body: body($i).body, entity: entity(body($i).entity), actionUrl: body($i).actionUrl }) : er({ code: 'BAD_METHOD' }),
  '/notifications/:alias/unread/count': async v => $i.request.method === 'GET' ? n.countUnreadNotifications({ $i, aliasId: v.alias }) : er({ code: 'BAD_METHOD' }),
  '/notifications/:alias/read/all': async v => $i.request.method === 'POST' ? n.markAllNotificationsRead({ $i, aliasId: v.alias }) : er({ code: 'BAD_METHOD' }),
  '/notifications/:alias/preferences': async v => $i.request.method === 'GET' ? n.getNotificationPreferences({ $i, aliasId: v.alias }) : n.updateNotificationPreferences({ $i, aliasId: v.alias, patch: body($i) }),
  '/notifications/:alias/poll': async v => $i.request.method === 'GET' ? n.pollNotifications({ $i, aliasId: v.alias, since: $i.$_GET?.since || 0 }) : er({ code: 'BAD_METHOD' }),
  '/notifications/:alias/:notification/read': async v => ['POST','PUT'].includes($i.request.method) ? n.markNotificationRead({ $i, aliasId: v.alias, notificationId: v.notification }) : er({ code: 'BAD_METHOD' }),
  '/notifications/:alias/:notification/archive': async v => ['POST','PUT'].includes($i.request.method) ? n.archiveNotification({ $i, aliasId: v.alias, notificationId: v.notification }) : er({ code: 'BAD_METHOD' }),
  '/notifications/:alias/:notification': async v => $i.request.method === 'DELETE' ? n.deleteNotification({ $i, aliasId: v.alias, notificationId: v.notification }) : er({ code: 'BAD_METHOD' }),
  '/notifications/:alias': async v => $i.request.method === 'GET' ? n.listNotifications({ $i, aliasId: v.alias, includeRead: $i.$_GET?.includeRead !== 'false', includeArchived: $i.$_GET?.includeArchived === 'true', type: $i.$_GET?.type, search: $i.$_GET?.search, limit: $i.$_GET?.limit || 50, offset: $i.$_GET?.offset || 0 }) : n.createNotification({ $i, toAliasId: v.alias, fromAliasId: body($i).fromAliasId, type: body($i).type, title: body($i).title, body: body($i).body, entity: entity(body($i).entity), actionUrl: body($i).actionUrl })
});
