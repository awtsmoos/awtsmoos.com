/**
 * B"H
 * Unified Email API
 */

module.exports = {
    getMail,
    sendMail,
    deleteMail,
    setEmailAsRead,
    deleteThread,
    saveSettings,
    getSettings,
    approveSender
}
var vm = require('vm');
var { NO_LOGIN, sp } = require("./_awtsmoos.constants.js");
var { loggedIn, er, myOpts } = require("./general.js");
var { verifyAliasOwnership } = require("./alias.js");

function parseEmailEntry(entry, id, friendName) {
    if (entry.rawData) {
        // Legacy/Raw Fallback (If ingress parser failed previously)
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
        // Standard Object (Created by new Ingress or Local)
        return {
            id,
            from: entry.from,
            fromName: entry.fromName, 
            fromEmail: entry.fromEmail, 
            subject: entry.subject,
            // B"H - Ensure content is ALWAYS a string, even if DB has a number
            content: String(entry.content || ""), 
            attachments: entry.attachments || [], 
            timeSent: parseInt(entry.time) || Date.now(),
            read: entry.read || false,
            direction: entry.direction,
            isRaw: false
        };
    
    }
}

// B"H
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

        // --- A. THREADS VIEW ---
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
                        p.rawRead = m.read; // Keep raw status for counting
                        return p;
                    }).filter(Boolean);

                    if (msgs.length > 0) {
                        msgs.sort((a, b) => b.timeSent - a.timeSent);
                        var latest = msgs[0];
                        
                        // Count actual unread in DB
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

        // --- B. MESSAGES VIEW (WITH AUTO-READ) ---
        else if (view === 'messages' && threadId) {
            var coreTarget = normalize(threadId);
            var pathsToCheck = getVariations(coreTarget);
            var mergedMessages = [];
            var seenIds = new Set();
            
            // Collect all updates to be made
            var updatesPromise = [];

            for (var p of pathsToCheck) {
                var fullThread = await $i.db.get(`${threadsPath}/${p}`);
                if (fullThread) {
                    Object.keys(fullThread).forEach(key => {
                        var m = fullThread[key];
                        if (!m) return;
                        if(seenIds.has(key)) return;
                        seenIds.add(key);

                        // B"H - AUTO-READ LOGIC
                        // If we are serving this message, and it is unread & incoming,
                        // we mark it as read immediately in the DB.
                        if (m.direction === 'incoming' && m.read === false) {
                            m.read = true; // Update memory for response
                            
                            // Queue the disk write
                            // Note: We use updateEntry to persist the change
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

            // Execute DB writes in background (Fire & Forget, but server-side)
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


// B"H
async function sendMail({ $i, userid, asAliasId, toAliasId, toEmail }) {
    console.log(`B"H DEBUG: sendMail INVOKED. From: [${asAliasId}] ToAlias: [${toAliasId}] ToEmail: [${toEmail}]`);

    if (!loggedIn($i)) {
        console.log("B\"H DEBUG: sendMail FAILED. User not logged in.");
        return er(NO_LOGIN);
    }

    // 1. Verify Sender
    var verified = await verifyAliasOwnership(asAliasId, $i, userid);
    if (!verified) {
        console.log(`B"H DEBUG: sendMail FAILED. Ownership verify failed for [${asAliasId}] user [${userid}]`);
        return er({ message: "Not your alias", code: "AUTH_FAIL" });
    }

    // 2. Determine Recipient & Paths
    var senderShort = asAliasId.toLowerCase();
    var senderFull = `${senderShort}_at_awtsmoos.com`;
    var recipientShort = "";
    var recipientFull = "";
    var targetEmailDisplay = "";
    var isLocal = false;

    // Helper to check DB for local user existence
    async function checkLocalDB(shortId) {
        var info = await $i.db.get(`${sp}/aliases/${shortId}/info`);
        return !!info;
    }

    // Resolve Recipient
    if (toAliasId) {
        // Clean up input
        let cleanId = toAliasId.toLowerCase().trim();
        
        // 1. Check if it explicitly looks like our domain
        if (cleanId.includes("awtsmoos.com")) {
            // Extract core name: "abarbanel_at_awtsmoos.com" -> "abarbanel"
            let core = cleanId.split(/[@_]/)[0];
            
            if (await checkLocalDB(core)) {
                isLocal = true;
                recipientShort = core;
                recipientFull = `${core}_at_awtsmoos.com`;
                targetEmailDisplay = `${core}@awtsmoos.com`;
            } else {
                // Domain matches but user doesn't exist? Treat as external or error
                isLocal = false;
                recipientFull = cleanId.replace("@", "_at_");
                targetEmailDisplay = cleanId.replace("_at_", "@");
            }
        }
        // 2. Check if it's just a short name "abarbanel"
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
        // 3. Complex external ID "friend@gmail.com"
        else {
            isLocal = false;
            recipientFull = cleanId.replace("@", "_at_");
            targetEmailDisplay = cleanId.replace("_at_", "@");
        }
    } 
    else if (toEmail) {
        // Same logic for email input
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

    console.log(`B"H DEBUG: Resolve Complete. SenderFull: [${senderFull}], RecipientFull: [${recipientFull}], IsLocal: [${isLocal}]`);

    var subject = $i.$_POST.subject || $i.$_GET.subject || "(No Subject)";
    var content = $i.$_POST.content || $i.$_GET.content || "";

    // B"H - SAFETY SEAL
    // The server parser turns "123" into a Number, which has no substring() method.
    // We must force the content back into a String to prevent the crash.
    if (typeof content !== "string") {
        content = String(content || "");
    }
    var time = Date.now();

    try {
        // === 3. WRITE TO SENDER (My Sent Folder) ===
        const senderPath = `/emails/${senderFull}/threads/${recipientFull}`;
        console.log(`B"H DEBUG: Writing to SENDER path: ${senderPath}`);
        
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
            // === 4. WRITE TO RECIPIENT (Their Inbox) ===
            const recipientPath = `/emails/${recipientFull}/threads/${senderFull}`;
            console.log(`B"H DEBUG: Writing to RECIPIENT path: ${recipientPath}`);
            
            // Get status
            var status = "inbox";
            // (Skipping complex gatekeeper check for debug clarity, defaulting to inbox)
            
            await $i.db.appendToObj(recipientPath, {
                key: time + "",
                value: {
                    from: senderShort,
                    fromName: senderShort,
                    to: targetEmailDisplay,
                    status: status,
                    subject,
                    content,
                    time,
                    read: false,
                    direction: "incoming",
                    correspondent: senderShort
                }
            });

            console.log("B\"H DEBUG: Recipient Write Complete. Attempting Socket Notify...");

            // C. Notify Recipient (WebSocket)
            if ($i.ws) {
                $i.ws.sendToAlias(recipientShort, {
                    type: 'NEW_MAIL',
                    message: {
                        id: `${senderFull}:${time}`,
                        uid: time + "",
                        from: senderShort,
                        fromName: senderShort,
                        subject: subject,
                        status: status,
                        snippet: content.substring(0, 50),
                        timeSent: time,
                        correspondent: senderShort,
                        direction: "incoming",
                        content: content
                    }
                });
            } else {
                console.log("B\"H DEBUG: $i.ws is UNDEFINED. Socket notification skipped.");
            }

            return { success: { message: "Sent internally" } };

        } else {
            console.log("B\"H DEBUG: Sending REMOTE (SMTP)...");
            // SMTP Logic ...
             if ($i.mail && $i.mail.smtpClient) {
                var myFullEmail = `${senderShort}@awtsmoos.com`;
                $i.mail.smtpClient.sendMail(myFullEmail, targetEmailDisplay, subject, content)
                    .catch(e => console.error("SMTP Error", e));
                return { success: { message: "Sent via SMTP" } };
            }
             return { success: { message: "Sent (Mock)" } };
        }

    } catch (e) {
        console.error("B\"H DEBUG: CRITICAL ERROR in sendMail:", e);
        return er({ message: "Transmission failed", details: e.message });
    }
}

async function deleteMail({ $i, userid, aliasId, messageId }) {
    if (!loggedIn($i)) return er(NO_LOGIN);
    if (!aliasId) return er({ message: "aliasId required" });

    // Verify ownership
    var verified = await verifyAliasOwnership(aliasId, $i, userid);
    if (!verified) return er({ message: "Not your alias" });

    // ID Format: friend_name:timestamp
    var parts = messageId.split(":");
    if (parts.length < 2) return er({ message: "Invalid ID format" });

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

    // Path: /emails/my_at_awtsmoos/threads/friend_at_gmail
    var myFolder = `${aliasId}_at_awtsmoos.com`;
    var path = `/emails/${myFolder}/threads/${threadId}`;

    // DosDB delete supports recursive directory deletion
    var res = await $i.db.delete(path);
    return { success: true, removed: res };
}

async function getSettings({ $i, userid, aliasId }) {
    if (!loggedIn($i)) return er(NO_LOGIN);
    var verified = await verifyAliasOwnership(aliasId, $i, userid);
    if (!verified) return er({ message: "Auth fail" });

    var path = `/social/aliases/${aliasId}/emailSettings`;
    var set = await $i.db.get(path) || { 
        gatekeeperMode: false,
        approved: {},
        rules: []
    };
    return set;
}

async function saveSettings({ $i, userid, aliasId, settings }) {
    if (!loggedIn($i)) return er(NO_LOGIN);
    var verified = await verifyAliasOwnership(aliasId, $i, userid);
    if (!verified) return er({ message: "Auth fail" });

    // Parse if sent as string
    if(typeof settings === 'string') {
        try { settings = JSON.parse(settings); } catch(e){}
    }

    var path = `/social/aliases/${aliasId}/emailSettings`;
    await $i.db.write(path, settings); // Use write (overwrite) not append
    return { success: true };
}

async function approveSender({ $i, userid, aliasId, senderId }) {
    // 1. Add to approved list
    var settings = await getSettings({ $i, userid, aliasId });
    if(settings.error) return settings;
    
    if(!settings.approved) settings.approved = {};
    settings.approved[senderId] = true;
    
    await saveSettings({ $i, userid, aliasId, settings });

    // 2. Mark existing messages in that thread as "inbox" (Optional, UI can just treat them as ok)
    // To do this strictly, we'd iterate the thread messages and update status.
    // For now, simpler: UI checks whitelist.
    
    return { success: true, message: "Sender approved" };
}



// B"H - LOCAL INTELLIGENCE HELPERS

async function sendSystemLocalMail($i, fromAlias, toAlias, subject, content) {
    // Bypasses auth checks because the System (Server) is sending it
    var time = Date.now();
    var fromFolder = `${fromAlias}_at_awtsmoos.com`;
    var toFolder = `${toAlias}_at_awtsmoos.com`;
    var targetEmail = `${toAlias}@awtsmoos.com`;

    // 1. Write to Sender's Outbox (The Bot/System User)
    await $i.db.appendToObj(`/emails/${fromFolder}/threads/${toFolder}`, {
        key: time + "",
        value: {
            from: fromAlias, to: targetEmail, subject, content, time, read: true, direction: "outgoing"
        }
    });

    // 2. Write to Recipient's Inbox
    await $i.db.appendToObj(`/emails/${toFolder}/threads/${fromFolder}`, {
        key: time + "",
        value: {
            from: fromAlias, fromName: fromAlias, to: targetEmail,
            subject, content, time, read: false, direction: "incoming", correspondent: fromAlias, status: "inbox"
        }
    });

    // 3. Notify
    if ($i.ws) {
        var socketTarget = toAlias; // Already short in this context
        
        $i.ws.sendToAlias(socketTarget, {
            type: 'NEW_MAIL',
            message: {
                id: `${fromFolder}:${time}`,
                uid: time + "",
                from: fromAlias, 
                fromName: fromAlias,
                subject, 
                snippet: content.substring(0, 50),
                content, 
                timeSent: time, 
                correspondent: fromAlias, 
                direction: "incoming", 
                status: "inbox"
            }
        });
    }
}

async function runLocalRules($i, settings, msg) {
    try {
        // 1. Structured Rules
        if (settings.rules && Array.isArray(settings.rules)) {
            for (let rule of settings.rules) {
                if (!rule.enabled) continue;
                let match = false;
                let matchedKw = "";
                const text = (msg.content || "").toLowerCase();
                const keywords = (rule.keywords || "").toLowerCase().split(',').map(k=>k.trim()).filter(Boolean);

                if (rule.condition === 'contains_any') {
                    const found = keywords.find(k => text.includes(k));
                    if(found) { match = true; matchedKw = found; }
                } 
                else if (rule.condition === 'contains_only') {
                    let clean = text;
                    keywords.forEach(k => clean = clean.replace(k, ''));
                    if (clean.replace(/[^a-z0-9]/g, '').length < 5 && keywords.some(k => text.includes(k))) {
                        match = true; matchedKw = keywords[0];
                    }
                }
                else if (rule.condition === 'javascript') {
                    const sandbox = { msg, text };
                    vm.createContext(sandbox);
                    try { match = vm.runInContext(rule.customCondition, sandbox, { timeout: 500 }); } catch(e){}
                }

                if (match) {
                    let replyText = "";
                    if (rule.actionType === 'javascript') {
                        const sandbox = { msg, matchedKeyword: matchedKw, reply: (t) => { replyText = t; } };
                        vm.createContext(sandbox);
                        try { vm.runInContext(rule.replyScript, sandbox, { timeout: 500 }); } catch(e){}
                    } else {
                        replyText = processReplyVariables(rule.replyText, matchedKw, msg.content);
                    }

                    if (replyText) {
                        await sendSystemLocalMail($i, msg.to, msg.from, "Re: " + msg.subject, replyText);
                    }
                    break; // One rule per message?
                }
            }
        }
    } catch(e) { console.log("Local Rule Error", e); }
}

function processReplyVariables(template, keyword, fullText) {
    if(!template) return "";
    return template.replace(/\$([a-zA-Z0-9]+)\+(\d+)/g, (match, key, offset) => {
        const targetWord = (key.toLowerCase() === "keyword") ? keyword : key.toLowerCase();
        const textWords = (fullText||"").replace(/\n/g, " ").split(" ");
        const index = textWords.findIndex(w => w.toLowerCase().includes(targetWord));
        if (index === -1) return "[?] bs";
        const targetIndex = index + parseInt(offset);
        return textWords[targetIndex] || "";
    });
}
