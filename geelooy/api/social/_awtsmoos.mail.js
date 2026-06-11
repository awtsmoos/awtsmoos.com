// B"H
/**
 * @module AwtsmoosMailRoutes
 * @description
 * Chapter 176: Mail remains its original working system, but now gains universe
 * routes so a private thread can be mirrored, linked, forked, referenced, and
 * rendered like every other entity without disturbing inbox behavior.
 */

const {
    getMail, sendMail, deleteMail, setEmailAsRead,
    deleteThread, saveSettings, getSettings, approveSender,
    getUnreadCount,
    subscribeToPush,
    getLatestNotification
} = require("./helper/index.js");

const { mirrorMailThread, linkMailThreadToEntity } = require("./helper/mail/mailUniverse.js");

module.exports = ({ $i, userid } = {}) => ({
    "/mail": async () => "B\"H - Awtsmoos Mail System Active",

    "/mail/universe/mirror": async () => {
        if ($i.request.method !== 'POST') return { error: { code: 'BAD_METHOD', message: 'Use POST.' } };
        let thread = $i.$_POST.thread;
        if (typeof thread === 'string') {
            try { thread = JSON.parse(thread); } catch { thread = null; }
        }
        return await mirrorMailThread({ $i, thread: thread || $i.$_POST });
    },

    "/mail/universe/:thread/link": async vars => {
        if ($i.request.method !== 'POST') return { error: { code: 'BAD_METHOD', message: 'Use POST.' } };
        let target = $i.$_POST.target;
        if (typeof target === 'string') {
            try { target = JSON.parse(target); } catch { target = null; }
        }
        return await linkMailThreadToEntity({ $i, threadId: vars.thread, target: target || { type: $i.$_POST.targetType, id: $i.$_POST.targetId }, actorAlias: $i.$_POST.actorAlias || $i.$_POST.aliasId || '' });
    },

    "/mail/notify/subscribe": async () => await subscribeToPush({ $i, userid, aliasId: $i.$_POST.aliasId, subscription: $i.$_POST.subscription }),
    "/mail/notify/getLatest": async () => await getLatestNotification({ $i, userid, aliasId: $i.$_GET.aliasId }),
    "/mail/unread/count": async () => await getUnreadCount({ $i, userid, aliasId: $i.$_GET.aliasId }),
    "/mail/delete/:messageId": async v => await deleteMail({ $i, userid, messageId: v.messageId, aliasId: $i.$_GET.aliasId }),
    "/mail/get/:mailId/": async v => await getMail({ $i, userid, aliasId: $i.$_GET.aliasId, threadId: $i.$_GET.threadId, mailId: v.mailId }),
    "/mail/get/:mailId/read": async v => await setEmailAsRead({ $i, userid, messageId: v.mailId, aliasId: $i.$_GET.aliasId }),

    "/mail/sendTo/:toAlias/from/:fromAlias": async v => {
        const toAliasId = v.toAlias === "external" ? null : v.toAlias;
        return await sendMail({ $i, userid, asAliasId: v.fromAlias, toAliasId, toEmail: $i.$_GET.toEmail || $i.$_POST.toEmail });
    },

    "/mail/get": async () => await getMail({ $i, userid, aliasId: $i.$_GET.aliasId, threadId: $i.$_GET.threadId, view: $i.$_GET.view, page: $i.$_GET.page, pageSize: $i.$_GET.pageSize }),
    "/mail/thread/delete/:threadId": async v => await deleteThread({ $i, userid, aliasId: $i.$_GET.aliasId, threadId: v.threadId }),
    "/mail/settings/get": async () => await getSettings({ $i, userid, aliasId: $i.$_GET.aliasId }),
    "/mail/settings/save": async () => await saveSettings({ $i, userid, aliasId: $i.$_POST.aliasId, settings: $i.$_POST.settings }),
    "/mail/approve/:senderId": async v => await approveSender({ $i, userid, aliasId: $i.$_POST.aliasId || $i.$_GET.aliasId, senderId: v.senderId })
});
