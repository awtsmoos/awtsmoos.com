// B"H
/**
 * @module AwtsmoosMailRoutes
 * @description Mail keeps the old river and gains compatibility banks: the UI
 * may call the canonical thread delete route or the shorter legacy action, and
 * both arrive at the same helper without splitting worlds.
 */
const {
    getMail, sendMail, deleteMail, setEmailAsRead,
    deleteThread, saveSettings, getSettings, approveSender,
    getUnreadCount, subscribeToPush, getLatestNotification
} = require("./helper/index.js");
const { mirrorMailThread, linkMailThreadToEntity } = require("./helper/mail/mailUniverse.js");

function badMethod() { return { error: { code: 'BAD_METHOD', message: 'Use POST.' } }; }
function postBody($i) { return $i.$_POST || {}; }
function query($i) { return $i.$_GET || {}; }
function aliasFrom($i) { return postBody($i).aliasId || query($i).aliasId; }
function parseMaybeJson(value) {
    if (typeof value !== 'string') return value;
    try { return JSON.parse(value); } catch { return null; }
}
function mirrorRoute($i) {
    if ($i.request.method !== 'POST') return badMethod();
    const body = postBody($i);
    return mirrorMailThread({ $i, thread: parseMaybeJson(body.thread) || body });
}
function linkRoute($i, vars) {
    if ($i.request.method !== 'POST') return badMethod();
    const body = postBody($i);
    const target = parseMaybeJson(body.target) || { type: body.targetType, id: body.targetId };
    return linkMailThreadToEntity({ $i, threadId: vars.thread, target, actorAlias: body.actorAlias || body.aliasId || '' });
}
function deleteThreadRoute($i, userid, threadId) {
    return deleteThread({ $i, userid, aliasId: aliasFrom($i), threadId: threadId || postBody($i).threadId || query($i).threadId });
}

module.exports = ({ $i, userid } = {}) => ({
    "/mail": async () => "B\"H - Awtsmoos Mail System Active",
    "/mail/universe/mirror": async () => await mirrorRoute($i),
    "/mail/universe/:thread/link": async vars => await linkRoute($i, vars),
    "/mail/notify/subscribe": async () => await subscribeToPush({ $i, userid, aliasId: postBody($i).aliasId, subscription: postBody($i).subscription }),
    "/mail/notify/getLatest": async () => await getLatestNotification({ $i, userid, aliasId: query($i).aliasId }),
    "/mail/unread/count": async () => await getUnreadCount({ $i, userid, aliasId: query($i).aliasId }),
    "/mail/delete/:messageId": async v => await deleteMail({ $i, userid, messageId: v.messageId, aliasId: query($i).aliasId }),
    "/mail/get/:mailId/": async v => await getMail({ $i, userid, aliasId: query($i).aliasId, threadId: query($i).threadId, mailId: v.mailId }),
    "/mail/get/:mailId/read": async v => await setEmailAsRead({ $i, userid, messageId: v.mailId, aliasId: query($i).aliasId }),
    "/mail/sendTo/:toAlias/from/:fromAlias": async v => await sendMail({
        $i, userid, asAliasId: v.fromAlias,
        toAliasId: v.toAlias === "external" ? null : v.toAlias,
        toEmail: query($i).toEmail || postBody($i).toEmail
    }),
    "/mail/get": async () => await getMail({
        $i, userid, aliasId: query($i).aliasId, threadId: query($i).threadId,
        view: query($i).view, page: query($i).page, pageSize: query($i).pageSize
    }),
    "/mail/thread/delete/:threadId": async v => await deleteThreadRoute($i, userid, v.threadId),
    "/mail/deleteThread": async () => await deleteThreadRoute($i, userid),
    "/mail/settings/get": async () => await getSettings({ $i, userid, aliasId: query($i).aliasId }),
    "/mail/settings/save": async () => await saveSettings({ $i, userid, aliasId: postBody($i).aliasId, settings: postBody($i).settings }),
    "/mail/approve/:senderId": async v => await approveSender({ $i, userid, aliasId: aliasFrom($i), senderId: v.senderId })
});
