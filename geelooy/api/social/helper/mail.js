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
            fromName: entry.fromName, // Add name
            fromEmail: entry.fromEmail, // Add email
            subject: entry.subject,
            content: entry.content,
            attachments: entry.attachments || [], // Pass attachments
            timeSent: parseInt(entry.time) || Date.now(),
            read: entry.read || false,
            direction: entry.direction,
            isRaw: false
        };
    }
}

// B"H
// B"H
async function getMail({ $i, userid, aliasId, threadId, page = 1, pageSize = 20, view = 'threads' }) {
    if (!loggedIn($i)) return er(NO_LOGIN);
    if (!aliasId) return er({ message: "aliasId required" });

    var verified = await verifyAliasOwnership(aliasId, $i, userid);
    if (!verified) return er({ message: "Auth fail", code: "AUTH_FAIL" });

    var myFolder = `${aliasId}_at_awtsmoos.com`;
    var threadsPath = `/emails/${myFolder}/threads`;

    try {
        // 1. Get List of Conversations (Friends)
        var friends = await $i.db.get(threadsPath);
        if (!friends || (Array.isArray(friends) && friends.length === 0)) return [];

        // If friends is an object (folders), extract keys
        if (typeof friends === 'object' && !Array.isArray(friends)) {
            friends = Object.keys(friends);
        }

        // --- A. THREADS VIEW (Snippets) ---
        if (view === 'threads') {
            var snippets = [];

            for (var friendName of friends) {
                // Brute Force: Get the ENTIRE thread object
                var fullThread = await $i.db.get(`${threadsPath}/${friendName}`);
                
                if (fullThread && typeof fullThread === 'object') {
                    // Convert to array
                    var msgs = Object.keys(fullThread).map(key => {
                        var m = fullThread[key];
                        // Ensure we have a valid object
                        if(!m) return null;
                        var p = parseEmailEntry(m, `${friendName}:${key}`, friendName);
                        p.correspondent = friendName;
                        p.uid = key;
                        return p;
                    }).filter(Boolean);

                    if (msgs.length > 0) {
                        // Sort descending (Newest first)
                        msgs.sort((a, b) => b.timeSent - a.timeSent);
                        // Take the newest one
                        snippets.push(msgs[0]);
                    }
                }
            }

            // Sort all snippets by time (Newest on top)
            return snippets.sort((a, b) => b.timeSent - a.timeSent);
        }

        // --- B. MESSAGES VIEW (Full Chat History) ---
        else if (view === 'messages' && threadId) {
            // Brute Force: Get the ENTIRE thread
            var fullThread = await $i.db.get(`${threadsPath}/${threadId}`);
            
            if (!fullThread) return [];

            var allMessages = Object.keys(fullThread).map(key => {
                var m = fullThread[key];
                if(!m) return null;
                var p = parseEmailEntry(m, `${threadId}:${key}`, threadId);
                p.correspondent = threadId;
                p.uid = key;
                return p;
            }).filter(Boolean);

            // Sort Descending first (Newest -> Oldest) to handle pagination correctly
            allMessages.sort((a, b) => b.timeSent - a.timeSent);

            // Apply Pagination in Memory (Reliable)
            var start = (page - 1) * pageSize;
            var end = start + parseInt(pageSize);
            var sliced = allMessages.slice(start, end);

            // Return Chronological (Oldest -> Newest) for the Chat UI
            return sliced.sort((a, b) => a.timeSent - b.timeSent);
        }

        return [];

    } catch (e) {
        return er({ message: "Fetch failed", details: e + "" });
    }
}


async function sendMail({ $i, userid, asAliasId, toAliasId, toEmail }) {
    if (!loggedIn($i)) return er(NO_LOGIN);

    // 1. Verify Sender
    var verified = await verifyAliasOwnership(asAliasId, $i, userid);
    if (!verified) return er({ message: "Not your alias", code: "AUTH_FAIL" });

    // 2. Determine Recipient
    var targetEmail = "";
    var isLocal = false;
    var friendClean = "";
    var checkLocal = async (id) => await $i.db.get(`${sp}/aliases/${id}/info`);

    if (toAliasId) {
        var info = await checkLocal(toAliasId);
        if (info) {
            isLocal = true;
            targetEmail = `${toAliasId}@awtsmoos.com`;
            friendClean = `${toAliasId}_at_awtsmoos.com`;
        } else {
            if (toAliasId.includes("_at_")) {
                isLocal = false;
                targetEmail = toAliasId.replace("_at_", "@");
                friendClean = toAliasId;
            } else if (toAliasId.includes("@")) {
                isLocal = false;
                targetEmail = toAliasId;
                friendClean = toAliasId.replace("@", "_at_").replace(/[<>]/g, "");
            } else {
                return er({ message: "Recipient alias not found", code: "RCPT_NOT_FOUND" });
            }
        }
    } 
    else if (toEmail) {
        targetEmail = toEmail;
        friendClean = targetEmail.replace("@", "_at_").replace(/[<>]/g, "");
        if(targetEmail.endsWith("@awtsmoos.com")) {
             var possibleAlias = targetEmail.split("@")[0];
             var info = await checkLocal(possibleAlias);
             if(info) {
                 isLocal = true;
                 friendClean = `${possibleAlias}_at_awtsmoos.com`; 
             }
        }
    } else {
        return er({ message: "Must provide recipient", code: "NO_RCPT" });
    }

    var subject = $i.$_POST.subject || $i.$_GET.subject || "(No Subject)";
    var content = $i.$_POST.content || $i.$_GET.content || "";
    var time = Date.now();
    var myFolder = `${asAliasId}_at_awtsmoos.com`; 

    // 3. SENDING LOGIC
    try {
        if (isLocal) {
            // === LOCAL SEND (INTERNAL) ===
            
            // A. Save to My Sent
            await $i.db.appendToObj(`/emails/${myFolder}/threads/${friendClean}`, {
                key: time + "",
                value: {
                    from: asAliasId, to: targetEmail,
                    subject, content, time, read: true, direction: "outgoing"
                }
            });

            // B. INTELLIGENCE LAYER (For the Recipient)
            var recipientAlias = friendClean.split("_at_")[0]; // "bob" from "bob_at_..."
            
            // 1. Load Their Settings
            var settingsPath = `/social/aliases/${recipientAlias}/emailSettings`;
            var settings = await $i.db.get(settingsPath) || { approved: {}, rules: [] };
            if(!settings.approved) settings.approved = {};

            // 2. Determine Status
           var senderThreadId = myFolder; 
            var senderAliasClean = asAliasId;
            var status = "inbox";
            
            // B"H - Check both formats to ensure approval is detected
            var isApproved = settings.approved[senderThreadId] || settings.approved[senderAliasClean];
            
            if (settings.gatekeeperMode && !isApproved) {
                status = "request";
                // Auto-Reply if not a reply itself (avoid loops)
                if (!subject.includes("Message Request")) {
                    await sendSystemLocalMail($i, recipientAlias, asAliasId, 
                        `Message Request Pending`, 
                        `B"H\n\nShalom,\n\n${recipientAlias} has yet to approve this message request.`
                    );
                }
            }

            // 3. Run Rules (Only if not blocked/request, or run on all?)
            // Usually we run rules on Inbox items.
            if (status === "inbox") {
                await runLocalRules($i, settings, {
                    from: asAliasId,
                    to: recipientAlias,
                    subject,
                    content
                });
            }

            // C. Save to Their Inbox (With Status)
            await $i.db.appendToObj(`/emails/${friendClean}/threads/${myFolder}`, {
                key: time + "",
                value: {
                    from: asAliasId,
                    fromName: asAliasId,
                    to: targetEmail,
                    status: status, // Saved Status
                    subject,
                    content,
                    time,
                    read: false,
                    direction: "incoming",
                    correspondent: asAliasId
                }
            });

            // D. Notify Them
            if ($i.ws) {
                // B"H - The Socket desires the Name, not the Garment.
                // We strip the domain to try the Essence first, but thanks to the new 
                // sendToAlias logic, the Full Name will also be checked automatically.
                var socketTarget = friendClean.split("_at_")[0]; 
                
                const notification = {
                    type: 'NEW_MAIL',
                    message: {
                        id: `${myFolder}:${time}`,
                        uid: time + "",
                        from: asAliasId, 
                        fromName: asAliasId, 
                        subject: subject, 
                        status: status,
                        snippet: content.substring(0, 50) + "...",
                        timeSent: time,
                        correspondent: asAliasId, 
                        direction: "incoming",
                        content: content 
                    }
                };
                
                // Send the spark. If 'socketTarget' (bob) fails, 
                // the Socket Logic will now attempt 'bob_at_awtsmoos.com'.
                $i.ws.sendToAlias(socketTarget, notification);
            }

            return { success: { message: "Sent internally" } };

        } else {
            // === REMOTE SEND (External) ===
            if ($i.mail && $i.mail.smtpClient) {
                var myFullEmail = `${asAliasId}@awtsmoos.com`;
                const sendTask = $i.mail.smtpClient.sendMail(myFullEmail, targetEmail, subject, content);
                const timeoutTask = new Promise((_, reject) => setTimeout(() => reject(new Error("SMTP Timeout")), 10000));
                await Promise.race([sendTask, timeoutTask]);
            } else {
                return er({ message: "SMTP Client not available" });
            }

            await $i.db.appendToObj(`/emails/${myFolder}/threads/${friendClean}`, {
                key: time + "",
                value: {
                    from: asAliasId, to: targetEmail,
                    subject, content, time, read: true, direction: "outgoing"
                }
            });

            return { success: { message: "Sent via SMTP" } };
        }
    } catch (e) {
        return er({ message: "Send failed", details: e + "" });
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
