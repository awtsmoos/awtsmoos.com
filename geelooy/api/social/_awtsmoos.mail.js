/**
 * B"H
 * Awtsmoos Unified Mail Endpoints
 */

var {
    NO_LOGIN,
    sp,
    myOpts
} = require("./helper/_awtsmoos.constants.js");

var {
    getMail, sendMail, deleteMail, setEmailAsRead,
    deleteThread, saveSettings, getSettings, approveSender,
    getUnreadCount,
    subscribeToPush,       
    getLatestNotification
} = require("./helper/index.js");

var {
    loggedIn,
    er
} = require("./helper/general.js");

module.exports = ({
    $i,
    userid,
} = {}) => ({
    // Test endpoint
    "/mail": async () => {
        return "B\"H - Awtsmoos Mail System Active";
    },
    
    /**
     * POST /mail/notify/subscribe
     * Saves the VAPID subscription from the browser
     */
    "/mail/notify/subscribe": async () => {
        return await subscribeToPush({
            $i,
            userid,
            aliasId: $i.$_POST.aliasId,
            subscription: $i.$_POST.subscription
        });
    },

    /**
     * GET /mail/notify/getLatest
     * Called by Service Worker when it wakes up
     */
    "/mail/notify/getLatest": async () => {
        // Alias ID is usually passed in query, or inferred from session
        // Here we expect it in the query string ?aliasId=...
        return await getLatestNotification({
            $i,
            userid,
            aliasId: $i.$_GET.aliasId 
        });
    }
    
    /**
     * GET Total Unread Count
     * Route: /mail/unread/count?aliasId=myAlias
     */
    "/mail/unread/count": async () => {
        return await getUnreadCount({
            $i,
            userid,
            aliasId: $i.$_GET.aliasId
        });
    },

    /**
     * DELETE Message
     * Route: /mail/delete/:messageId?aliasId=myAlias
     */
    "/mail/delete/:messageId": async (v) => {
        return await deleteMail({
            $i,
            userid,
            messageId: v.messageId,
            aliasId: $i.$_GET.aliasId // Required param from query
        })
    },

    /**
     * GET Specific Message
     * Route: /mail/get/:mailId?aliasId=myAlias
     */
    "/mail/get/:mailId/": async (v) => {
        return await getMail({
            $i,
            userid,
            aliasId: $i.$_GET.aliasId, // Required param
            threadId: $i.$_GET.threadId, // Optional filter
            mailId: v.mailId // Specific message ID
        })
    },

    /**
     * MARK READ
     * Route: /mail/get/:mailId/read?aliasId=myAlias
     */
    "/mail/get/:mailId/read": async (v) => {
        return await setEmailAsRead({
            $i,
            userid,
            messageId: v.mailId,
            aliasId: $i.$_GET.aliasId // Required param
        })
    },

    /**
     * SEND Mail
     * Route: /mail/sendTo/:toAlias/from/:fromAlias
     * Body/Query: subject, content, toEmail (if external)
     * 
     * Note: If sending externally, :toAlias can be "external", 
     * and the actual email is passed in ?toEmail=...
     */
    "/mail/sendTo/:toAlias/from/:fromAlias": async (v) => {
        var toAliasId = v.toAlias;
        
        // Handle external routing convention from client
        if(toAliasId === "external") {
            toAliasId = null;
        }

        var toEmail = $i.$_GET.toEmail || $i.$_POST.toEmail;

        return await sendMail({
            $i,
            userid,
            asAliasId: v.fromAlias,
            toAliasId: toAliasId,
            toEmail: toEmail
        })
    },

    /**
     * GET Inbox (Threads)
     * Route: /mail/get?aliasId=myAlias
     */
    "/mail/get": async () => {
        return await getMail({
            $i,
            userid,
            aliasId: $i.$_GET.aliasId,
            threadId: $i.$_GET.threadId,
            view: $i.$_GET.view,         // CRITICAL: was missing
            page: $i.$_GET.page,         // CRITICAL: was missing
            pageSize: $i.$_GET.pageSize
        })
    },
    
    "/mail/thread/delete/:threadId": async (v) => {
        return await deleteThread({
            $i, userid,
            aliasId: $i.$_GET.aliasId,
            threadId: v.threadId
        });
    },

    "/mail/settings/get": async () => {
        return await getSettings({
            $i, userid,
            aliasId: $i.$_GET.aliasId
        });
    },

    "/mail/settings/save": async () => {
        return await saveSettings({
            $i, userid,
            aliasId: $i.$_POST.aliasId,
            settings: $i.$_POST.settings
        });
    },

    "/mail/approve/:senderId": async (v) => {
        return await approveSender({
            $i, userid,
            aliasId: $i.$_POST.aliasId || $i.$_GET.aliasId,
            senderId: v.senderId
        });
    }
});