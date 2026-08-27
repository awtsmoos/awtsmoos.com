/**
 * B"H
 * Unified Email API
 * Fully implemented: Capsules, Loop Protection, Remote Auto-Reply, Ghost Typing
 */

module.exports = {
    getMail,
    sendMail,
    deleteMail,
    setEmailAsRead,
    deleteThread,
    saveSettings,
    getSettings,
    approveSender,
    getUnreadCount,
    getLatestNotification,
    subscribeToPush
};

var vm = require('vm');
var { NO_LOGIN, sp } = require("./_awtsmoos.constants.js");
var { loggedIn, er, myOpts } = require("./general.js");
var { verifyAliasOwnership } = require("./alias.js");




async function subscribeToPush({ $i, userid, aliasId, subscription }) {
    if (!loggedIn($i)) return er(NO_LOGIN);
    // Verify ownership
    var verified = await verifyAliasOwnership(aliasId, $i, userid);
    if (!verified) return er({ message: "Auth fail" });

    // Save the subscription object to the DB
    // We store it under the alias so we can look it up when email arrives
    try {
        var subPath = `/social/aliases/${aliasId}/push_sub`;
        
        // Handle parsing if sent as string
        var subData = subscription;
        if(typeof subData === 'string') {
            try { subData = JSON.parse(subData); } catch(e){}
        }

        await $i.db.write(subPath, subData);
        return { success: true, message: "Quantum Signal Registered" };
    } catch(e) {
        return er({ message: "Sub failed", details: e.message });
    }
}

async function getLatestNotification({ $i, userid, aliasId }) {
    // 1. Auth Check
    if (!loggedIn($i)) return er(NO_LOGIN);
    
    // 2. We don't strictly verify ownership here because the Service Worker 
    // might be requesting this in background with a cookie. 
    // But ideally, we check if the cookie user owns the alias.
    // For now, assuming loggedIn($i) validates the session matches.

    var myFolder = `${aliasId}_at_awtsmoos.com`;
    var threadsPath = `/emails/${myFolder}/threads`;

    try {
        // 3. Scan for the most recent UNREAD message
        var folders = await $i.db.get(threadsPath);
        if (!folders) return { found: false };

        var latestMsg = null;
        var folderList = Array.isArray(folders) ? folders : Object.keys(folders);

        for (var folder of folderList) {
            var msgs = await $i.db.get(`${threadsPath}/${folder}`);
            if (msgs && typeof msgs === 'object') {
                var msgList = Object.values(msgs);
                for(var m of msgList) {
                    // Criteria: Incoming + Unread
                    if (m.direction === 'incoming' && !m.read) {
                        if (!latestMsg || m.timeSent > latestMsg.timeSent) {
                            latestMsg = m;
                        }
                    }
                }
            }
        }

        // 4. Return formatted data for the Notification API
        if (latestMsg) {
            // Decrypt/Format snippet
            var snippet = latestMsg.snippet || (latestMsg.textContent || "").substring(0, 50);
            
            return {
                found: true,
                title: latestMsg.fromName || latestMsg.from,
                body: snippet || "New Message",
                data: {
                    // Data needed for the "Reply" button action
                    id: latestMsg.id,
                    from: latestMsg.from, // Who sent it
                    to: aliasId,          // Who received it (me)
                    subject: latestMsg.subject,
                    correspondent: latestMsg.correspondent
                }
            };
        }

        return { found: false };

    } catch (e) {
        return er({ message: "Fetch error", details: e.message });
    }
}
// --- HELPER: Extract HTML Capsules ---
function extractCapsules(text) {
    let cleanText = text || "";
    let attachments = [];
    let counter = 1;

    const capsuleRegex = /```html\s*([\s\S]*?)```/gi;
    if (cleanText.match(capsuleRegex)) {
        cleanText = cleanText.replace(capsuleRegex, (match, code) => {
            const filename = `artifact_${Date.now()}_${counter++}.html`;
            attachments.push({
                filename: filename,
                content: code, 
                contentType: 'text/html'
            });
            return `\n[Attached HTML Artifact: ${filename}]\n`;
        });
    }

    if (/^\s*<!DOCTYPE html/i.test(cleanText) || /^\s*<html/i.test(cleanText)) {
        const filename = `document_${Date.now()}.html`;
        attachments.push({
            filename: filename,
            content: cleanText,
            contentType: 'text/html'
        });
        cleanText = "Please find the attached HTML document.";
    }

    return { cleanText, attachments };
}

// --- API FUNCTIONS ---

async function getUnreadCount({ $i, userid, aliasId }) {
    if (!loggedIn($i)) return er(NO_LOGIN);
    if (!aliasId) return er({ message: "aliasId required" });

    var verified = await verifyAliasOwnership(aliasId, $i, userid);
    if (!verified) return er({ message: "Auth fail", code: "AUTH_FAIL" });

    var myFolder = `${aliasId}_at_awtsmoos.com`;
    var threadsPath = `/emails/${myFolder}/threads`;

    try {
        var friendFolders = await $i.db.get(threadsPath);
        if (!friendFolders) return { count: 0 };
        
        var folders = Array.isArray(friendFolders) ? friendFolders : Object.keys(friendFolders);
        if (folders.length === 0) return { count: 0 };

        var totalUnread = 0;

        for (var folderName of folders) {
            var threadData = await $i.db.get(`${threadsPath}/${folderName}`);
            if (threadData && typeof threadData === 'object') {
                Object.values(threadData).forEach(m => {
                    if (m && m.direction === 'incoming' && m.read === false) {
                        totalUnread++;
                    }
                });
            }
        }
        return { success: true, count: totalUnread };
    } catch (e) {
        return er({ message: "Count failed", details: e + "" });
    }
}

function parseEmailEntry(entry, id, friendName) {
    if (entry.rawData) {
        var parts = entry.rawData.split("\r\n\r\n");
        var headers = parts[0] || "";
        var content = parts.slice(1).join("\r\n\r\n") || "";
        var subjectMatch = headers.match(/Subject: (.*)/i);
        var fromMatch = headers.match(/From: (.*)/i);
        return {
            id,
            from: fromMatch ? fromMatch[1] : friendName,
            subject: subjectMatch ? subjectMatch[1] : "(No Subject)",
            content: content,
            timeSent: parseInt(entry.time) || Date.now(),
            read: entry.read || false,
            direction: entry.direction || "incoming",
            isRaw: true
        };
    } else {
        return {
            id,
            from: entry.from,
            fromName: entry.fromName, 
            fromEmail: entry.fromEmail, 
            subject: entry.subject,
            content: String(entry.content || ""), 
            attachments: entry.attachments || [], 
            timeSent: parseInt(entry.time) || Date.now(),
            read: entry.read || false,
            direction: entry.direction,
            isRaw: false
        };
    }
}

async function getMail({ $i, userid, aliasId, threadId, page = 1, pageSize = 20, view = 'threads' }) {
    if (!loggedIn($i)) return er(NO_LOGIN);
    if (!aliasId) return er({ message: "aliasId required" });

    var verified = await verifyAliasOwnership(aliasId, $i, userid);
    if (!verified) return er({ message: "Auth fail", code: "AUTH_FAIL" });

    var myFolder = `${aliasId}_at_awtsmoos.com`;
    var threadsPath = `/emails/${myFolder}/threads`;

    const normalize = (name) => {
        if (name.endsWith("_at_awtsmoos.com")) return name.replace("_at_awtsmoos.com", "");
        if (name === aliasId) return name; 
        return name; 
    };

    const getVariations = (coreName) => {
        if (coreName.includes("_at_") && !coreName.endsWith("_at_awtsmoos.com")) return [coreName];
        return [ coreName, `${coreName}_at_awtsmoos.com` ];
    };

    try {
        var friendFolders = await $i.db.get(threadsPath);
        if (!friendFolders || (Array.isArray(friendFolders) && friendFolders.length === 0)) return [];
        if (typeof friendFolders === 'object' && !Array.isArray(friendFolders)) friendFolders = Object.keys(friendFolders);

        if (view === 'threads') {
            var grouped = {}; 
            for (var folderName of friendFolders) {
                var threadData = await $i.db.get(`${threadsPath}/${folderName}`);
                if (threadData && typeof threadData === 'object') {
                    var msgs = Object.keys(threadData).map(key => {
                        var m = threadData[key];
                        if(!m) return null;
                        var p = parseEmailEntry(m, `${folderName}:${key}`, folderName);
                        p.correspondent = folderName; 
                        p.uid = key;
                        p.rawRead = m.read; 
                        return p;
                    }).filter(Boolean);

                    if (msgs.length > 0) {
                        msgs.sort((a, b) => b.timeSent - a.timeSent);
                        var latest = msgs[0];
                        var unreadCount = 0;
                        msgs.forEach(m => {
                            if (!m.rawRead && m.direction === 'incoming') unreadCount++;
                        });
                        var core = normalize(folderName);
                        if (!grouped[core] || latest.timeSent > grouped[core].timeSent) {
                            latest.correspondent = core; 
                            latest.unreadCount = unreadCount;
                            grouped[core] = latest;
                        } else if (grouped[core]) {
                            grouped[core].unreadCount = (grouped[core].unreadCount || 0) + unreadCount;
                        }
                    }
                }
            }
            return Object.values(grouped).sort((a, b) => b.timeSent - a.timeSent);
        }
        else if (view === 'messages' && threadId) {
            var coreTarget = normalize(threadId);
            var pathsToCheck = getVariations(coreTarget);
            var mergedMessages = [];
            var seenIds = new Set();
            var updatesPromise = [];

            for (var p of pathsToCheck) {
                var fullThread = await $i.db.get(`${threadsPath}/${p}`);
                if (fullThread) {
                    Object.keys(fullThread).forEach(key => {
                        var m = fullThread[key];
                        if (!m) return;
                        if(seenIds.has(key)) return;
                        seenIds.add(key);

                        if (m.direction === 'incoming' && m.read === false) {
                            m.read = true; 
                            updatesPromise.push(
                                $i.db.updateEntry(`${threadsPath}/${p}`, { key: key, value: m })
                            );
                        }

                        var entry = parseEmailEntry(m, `${p}:${key}`, p);
                        entry.correspondent = coreTarget;
                        entry.uid = key;
                        mergedMessages.push(entry);
                    });
                }
            }
            if (updatesPromise.length > 0) {
                Promise.all(updatesPromise).catch(e => console.error("Auto-read DB update failed", e));
            }
            mergedMessages.sort((a, b) => b.timeSent - a.timeSent);
            var start = (page - 1) * pageSize;
            var end = start + parseInt(pageSize);
            var sliced = mergedMessages.slice(start, end);
            return sliced.sort((a, b) => a.timeSent - b.timeSent);
        }
        return [];
    } catch (e) {
        return er({ message: "Fetch failed", details: e + "" });
    }
}

async function sendMail({ $i, userid, asAliasId, toAliasId, toEmail }) {
    if (!loggedIn($i)) return er(NO_LOGIN);

    var verified = await verifyAliasOwnership(asAliasId, $i, userid);
    if (!verified) return er({ message: "Not your alias", code: "AUTH_FAIL" });

    var senderShort = asAliasId.toLowerCase();
    var senderFull = `${senderShort}_at_awtsmoos.com`;
    var recipientShort = "";
    var recipientFull = "";
    var targetEmailDisplay = "";
    var isLocal = false;

    async function checkLocalDB(shortId) {
        var info = await $i.db.get(`${sp}/aliases/${shortId}/info`);
        return !!info;
    }

    if (toAliasId) {
        let cleanId = toAliasId.toLowerCase().trim();
        if (cleanId.includes("awtsmoos.com")) {
            let core = cleanId.split(/[@_]/)[0];
            if (await checkLocalDB(core)) {
                isLocal = true;
                recipientShort = core;
                recipientFull = `${core}_at_awtsmoos.com`;
                targetEmailDisplay = `${core}@awtsmoos.com`;
            } else {
                isLocal = false;
                recipientFull = cleanId.replace("@", "_at_");
                targetEmailDisplay = cleanId.replace("_at_", "@");
            }
        }
        else if (!cleanId.includes("@") && !cleanId.includes("_at_")) {
             if (await checkLocalDB(cleanId)) {
                isLocal = true;
                recipientShort = cleanId;
                recipientFull = `${cleanId}_at_awtsmoos.com`;
                targetEmailDisplay = `${cleanId}@awtsmoos.com`;
            } else {
                 return er({ message: "Recipient alias not found locally", code: "RCPT_NOT_FOUND" });
            }
        }
        else {
            isLocal = false;
            recipientFull = cleanId.replace("@", "_at_");
            targetEmailDisplay = cleanId.replace("_at_", "@");
        }
    } 
    else if (toEmail) {
        let cleanEmail = toEmail.toLowerCase().trim();
        targetEmailDisplay = cleanEmail;
        if (cleanEmail.endsWith("@awtsmoos.com")) {
            let core = cleanEmail.split("@")[0];
             if (await checkLocalDB(core)) {
                isLocal = true;
                recipientShort = core;
                recipientFull = `${core}_at_awtsmoos.com`;
            } else {
                recipientFull = cleanEmail.replace("@", "_at_");
            }
        } else {
            recipientFull = cleanEmail.replace("@", "_at_").replace(/[<>]/g, "");
        }
    } else {
        return er({ message: "Must provide recipient", code: "NO_RCPT" });
    }

    var subject = $i.$_POST.subject || $i.$_GET.subject || "(No Subject)";
    var content = $i.$_POST.content || $i.$_GET.content || "";
    if (typeof content !== "string") content = String(content || "");
    var time = Date.now();

    try {
        const senderPath = `/emails/${senderFull}/threads/${recipientFull}`;
        await $i.db.appendToObj(senderPath, {
            key: time + "",
            value: {
                from: senderShort, 
                to: targetEmailDisplay,
                subject, content, time, 
                read: true, direction: "outgoing"
            }
        });

        if (isLocal) {
            const recipientPath = `/emails/${recipientFull}/threads/${senderFull}`;
            var settingsPath = `/social/aliases/${recipientShort}/emailSettings`;
            var settings = await $i.db.get(settingsPath) || { approved: {}, rules: [] };
            if(!settings.approved) settings.approved = {};

            var status = "inbox";
            if (settings.gatekeeperMode) {
                if (!settings.approved[senderShort] && !settings.approved[senderFull]) {
                    status = "request";
                }
            }
            
            await $i.db.appendToObj(recipientPath, {
                key: time + "",
                value: {
                    from: senderShort, fromName: senderShort, to: targetEmailDisplay,
                    status: status, subject, content, time,
                    read: false, direction: "incoming", correspondent: senderShort
                }
            });

            if ($i.ws) {
                $i.ws.sendToAlias(recipientShort, {
                    type: 'NEW_MAIL',
                    message: {
                        id: `${senderFull}:${time}`, uid: time + "", from: senderShort, fromName: senderShort,
                        subject: subject, status: status, snippet: content.substring(0, 50),
                        timeSent: time, correspondent: senderShort, direction: "incoming", content: content
                    }
                });
            }

            if (status === "inbox" && $i.rulesEngine) {
                $i.rulesEngine.processRules({
                    settings,
                    msg: { from: asAliasId, to: recipientShort, subject, content },
                    dependencies: {
                        callAi: $i.callAi, 
                        stream: (partial) => {
                            if($i.ws) {
                                // 1. User B (Recipient) sees their own bot typing
                                $i.ws.sendToAlias(recipientShort, {
                                    type: 'LIVE_PREVIEW',
                                    from: senderShort, 
                                    content: partial
                                });
                                // 2. User A (Sender) sees "Ghost Typing" from User B
                                $i.ws.sendToAlias(senderShort, {
                                    type: 'LIVE_PREVIEW',
                                    from: recipientShort, 
                                    content: partial
                                });
                            }
                        },
                        reply: (text) => sendSystemLocalMail($i, recipientShort, senderShort, "Re: " + subject, text),
                        console: console
                    }
                });
            }
            return { success: { message: "Sent internally" } };
        
        } else {
            // === 6. EXTERNAL SEND (SMTP) ===
            var { cleanText, attachments } = extractCapsules(content);
            var myFullEmail = `${senderShort}@awtsmoos.com`;
            
            // B"H - FORMATTING FIX: Use <br> replacement for compatibility
            let finalHtml = cleanText;
            if (!/^\s*<(div|p|html|body|table)/i.test(finalHtml)) {
                 // We explicitly replace \n with <br> AND use pre-wrap as a backup
                 finalHtml = `<div dir="auto" style="font-family:sans-serif; font-size:14px; white-space: pre-wrap;">${cleanText.replace(/\n/g, '<br>')}</div>`;
            }

            var extraHeaders = {
                'Content-Type': 'text/html; charset=utf-8'
            };

            if ($i.mail && $i.mail.smtpClient) {
                await $i.mail.smtpClient.sendMail(
                    myFullEmail, 
                    targetEmailDisplay, 
                    subject, 
                    finalHtml, 
                    extraHeaders,
                    attachments 
                );
                return { success: { message: "Sent via SMTP (HTML + Capsules)" } };
            }
            
            return { success: { message: "SMTP Client Missing" } };
        }
    } catch (e) {
        return er({ message: "Transmission failed", details: e.message });
    }
}

async function deleteMail({ $i, userid, aliasId, messageId }) {
    if (!loggedIn($i)) return er(NO_LOGIN);
    if (!aliasId) return er({ message: "aliasId required" });
    var verified = await verifyAliasOwnership(aliasId, $i, userid);
    if (!verified) return er({ message: "Not your alias" });
    var parts = messageId.split(":");
    var friendName = parts[0];
    var timestamp = parts[1];
    var myFolder = `${aliasId}_at_awtsmoos.com`;
    var path = `/emails/${myFolder}/threads/${friendName}`;
    try {
        var res = await $i.db.deleteEntry(path, timestamp);
        return { success: { message: "Deleted", details: res } };
    } catch (e) {
        return er({ message: "Delete failed", details: e + "" });
    }
}

async function setEmailAsRead({ $i, userid, aliasId, messageId }) {
    if (!loggedIn($i)) return er(NO_LOGIN);
    if (!aliasId) return er({ message: "aliasId required" });
    var verified = await verifyAliasOwnership(aliasId, $i, userid);
    if (!verified) return er({ message: "Not your alias" });
    var parts = messageId.split(":");
    var friendName = parts[0];
    var timestamp = parts[1];
    var myFolder = `${aliasId}_at_awtsmoos.com`;
    var path = `/emails/${myFolder}/threads/${friendName}`;
    try {
        var msg = await $i.db.getValue(path, timestamp);
        if (!msg) return er({ message: "Message not found" });
        msg.read = true;
        await $i.db.updateEntry(path, { key: timestamp, value: msg });
        return { success: { message: "Read" } };
    } catch (e) {
        return er({ message: "Update failed", details: e + "" });
    }
}

async function deleteThread({ $i, userid, aliasId, threadId }) {
    if (!loggedIn($i)) return er(NO_LOGIN);
    var verified = await verifyAliasOwnership(aliasId, $i, userid);
    if (!verified) return er({ message: "Auth fail" });
    var myFolder = `${aliasId}_at_awtsmoos.com`;
    var path = `/emails/${myFolder}/threads/${threadId}`;
    var res = await $i.db.delete(path);
    return { success: true, removed: res };
}

async function getSettings({ $i, userid, aliasId }) {
    if (!loggedIn($i)) return er(NO_LOGIN);
    var verified = await verifyAliasOwnership(aliasId, $i, userid);
    if (!verified) return er({ message: "Auth fail" });
    var path = `/social/aliases/${aliasId}/emailSettings`;
    var set = await $i.db.get(path) || { gatekeeperMode: false, approved: {}, rules: [] };
    return set;
}

async function saveSettings({ $i, userid, aliasId, settings }) {
    if (!loggedIn($i)) return er(NO_LOGIN);
    var verified = await verifyAliasOwnership(aliasId, $i, userid);
    if (!verified) return er({ message: "Auth fail" });
    if(typeof settings === 'string') {
        try { settings = JSON.parse(settings); } catch(e){}
    }
    var path = `/social/aliases/${aliasId}/emailSettings`;
    await $i.db.write(path, settings); 
    return { success: true };
}

async function approveSender({ $i, userid, aliasId, senderId }) {
    var settings = await getSettings({ $i, userid, aliasId });
    if(settings.error) return settings;
    if(!settings.approved) settings.approved = {};
    settings.approved[senderId] = true;
    await saveSettings({ $i, userid, aliasId, settings });
    return { success: true, message: "Sender approved" };
}

// B"H
// FIXED: Sends to BOTH Sender and Recipient Always
async function sendSystemLocalMail($i, fromAlias, toAlias, subject, content) {
    var fromShort = fromAlias.split('_at_')[0].split('@')[0];
    var toShort = toAlias.split('_at_')[0].split('@')[0];
    
    var isExternal = toAlias.includes("@") && !toAlias.includes("awtsmoos.com");
    if (toAlias.includes("_at_") && !toAlias.includes("awtsmoos")) isExternal = true;

    var time = Date.now();
    var fromFolder = `${fromShort}_at_awtsmoos.com`;
    
    var toFolder = toAlias;
    if (isExternal) {
        toFolder = toAlias.replace(/@/g, "_at_").replace(/[<>]/g, "");
    } else {
        toFolder = `${toShort}_at_awtsmoos.com`;
    }
    
    var targetEmail = isExternal ? toAlias.replace("_at_", "@") : `${toShort}@awtsmoos.com`;
    content = String(content || "");

    try {
        // 1. Write to Sender's Outbox
        await $i.db.appendToObj(`/emails/${fromFolder}/threads/${toFolder}`, {
            key: time + "",
            value: { from: fromShort, to: targetEmail, subject, content, time, read: true, direction: "outgoing" }
        });

        // 2. Notify Sender via Socket (ALWAYS, so my sent folder updates)
        if ($i.ws) {
            var correspondentForSender = isExternal ? toAlias : toShort;
            var senderMsg = { 
                id: `${toFolder}:${time}`, uid: time + "", 
                from: fromShort, to: toShort, subject, 
                snippet: content.substring(0, 50), content, 
                timeSent: time, 
                correspondent: correspondentForSender, 
                direction: "outgoing", read: true 
            };
            $i.ws.sendToAlias(fromShort, { type: 'NEW_MAIL', message: senderMsg });
            if (!fromShort.includes("_at_")) {
                $i.ws.sendToAlias(`${fromShort}_at_awtsmoos.com`, { type: 'NEW_MAIL', message: senderMsg });
            }
        }

        // 3. DELIVERY
        if (isExternal) {
            if ($i.mail && $i.mail.smtpClient) {
                var extraHeaders = {
                    'Content-Type': 'text/plain; charset=utf-8',
                    'Auto-Submitted': 'auto-replied',
                    'Precedence': 'bulk'
                };
                await $i.mail.smtpClient.sendMail(
                    `${fromShort}@awtsmoos.com`, targetEmail, subject, content, extraHeaders
                );
            }
        } else {
            // Local Delivery
            await $i.db.appendToObj(`/emails/${toFolder}/threads/${fromFolder}`, {
                key: time + "",
                value: { from: fromShort, fromName: fromShort, to: targetEmail, subject, content, time, read: false, direction: "incoming", correspondent: fromShort, status: "inbox" }
            });

            // Notify Recipient (ALWAYS, so they get the message)
            if ($i.ws) {
                $i.ws.sendToAlias(toShort, {
                    type: 'NEW_MAIL',
                    message: { 
                        id: `${fromFolder}:${time}`, uid: time + "", 
                        from: fromShort, fromName: fromShort, 
                        subject, snippet: content.substring(0, 50), content, 
                        timeSent: time, correspondent: fromShort, 
                        direction: "incoming", status: "inbox" 
                    }
                });
            }
        }
    } catch(e) {
        return { error: { code: "SYSTEM_MAIL_FAILED", message: e.message || "System mail failed" } };
    }
}
