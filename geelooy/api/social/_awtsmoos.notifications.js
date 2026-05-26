//B"H
/**
 * Durable social notification routes.
 */

const {
    createNotification,
    listNotifications,
    markNotificationRead,
    countUnreadNotifications,
    pollNotifications,
    fanoutNotification
} = require('./helper/notifications.js');

const { er } = require('./helper/general.js');

module.exports = ({ $i } = {}) => ({
    "/notifications/fanout": async () => {
        if ($i.request.method !== 'POST') return er({ code: 'BAD_METHOD', message: 'Use POST.' });
        return await fanoutNotification({
            $i,
            toAliases: parseAliases($i.$_POST.toAliases),
            fromAliasId: $i.$_POST.fromAliasId,
            type: $i.$_POST.type,
            title: $i.$_POST.title,
            body: $i.$_POST.body,
            entity: parseEntity($i.$_POST.entity),
            actionUrl: $i.$_POST.actionUrl
        });
    },

    "/notifications/:alias/unread/count": async vars => {
        if ($i.request.method !== 'GET') return er({ code: 'BAD_METHOD', message: 'Use GET.' });
        return await countUnreadNotifications({ $i, aliasId: vars.alias });
    },

    "/notifications/:alias/poll": async vars => {
        if ($i.request.method !== 'GET') return er({ code: 'BAD_METHOD', message: 'Use GET.' });
        return await pollNotifications({ $i, aliasId: vars.alias, since: $i.$_GET?.since || 0 });
    },

    "/notifications/:alias/:notification/read": async vars => {
        if ($i.request.method !== 'POST' && $i.request.method !== 'PUT') {
            return er({ code: 'BAD_METHOD', message: 'Use POST or PUT.' });
        }
        return await markNotificationRead({
            $i,
            aliasId: vars.alias,
            notificationId: vars.notification
        });
    },

    "/notifications/:alias": async vars => {
        if ($i.request.method === 'GET') {
            return await listNotifications({
                $i,
                aliasId: vars.alias,
                includeRead: $i.$_GET?.includeRead === 'yes' || $i.$_GET?.includeRead === 'true'
            });
        }
        if ($i.request.method === 'POST') {
            return await createNotification({
                $i,
                toAliasId: vars.alias,
                fromAliasId: $i.$_POST.fromAliasId,
                type: $i.$_POST.type,
                title: $i.$_POST.title,
                body: $i.$_POST.body,
                entity: parseEntity($i.$_POST.entity),
                actionUrl: $i.$_POST.actionUrl
            });
        }
        return er({ code: 'BAD_METHOD', message: 'Use GET or POST.' });
    }
});

function parseEntity(value) {
    if (!value) return {};
    if (typeof value === 'object') return value;
    try {
        return JSON.parse(value);
    } catch {
        return {};
    }
}

function parseAliases(value) {
    if (Array.isArray(value)) return value;
    return String(value || '').split(',').map(item => item.trim()).filter(Boolean);
}
