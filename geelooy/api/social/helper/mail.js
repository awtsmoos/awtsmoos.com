/**
 * B"H
 * Unified Email API
 */

module.exports = {
    getMail,
    sendMail,
    deleteMail,
    setEmailAsRead
}

var { NO_LOGIN, sp } = require("./_awtsmoos.constants.js");
var { loggedIn, er, myOpts } = require("./general.js");
var { verifyAliasOwnership } = require("./alias.js");

/**
 * Parses raw SMTP data if present, or returns simple object structure
 */
function parseEmailEntry(entry, id, friendName) {
    if (entry.rawData) {
        // It's a raw SMTP string (incoming from outside)
        var parts = entry.rawData.split("\r\n\r\n");
        var headers = parts[0] || "";
        var content = parts.slice(1).join("\r\n\r\n") || "";

        var subjectMatch = headers.match(/Subject: (.*)/i);
        var fromMatch = headers.match(/From: (.*)/i);

        return {
            id,
            from: fromMatch ? fromMatch[1] : friendName, // Use friend name if raw header fails
            subject: subjectMatch ? subjectMatch[1] : "(No Subject)",
            content: content,
            timeSent: parseInt(entry.time) || Date.now(),
            read: entry.read || false,
            direction: entry.direction || "incoming",
            isRaw: true
        };
    } else {
        // It's a local object (outgoing or internal)
        return {
            id,
            from: entry.from,
            subject: entry.subject,
            content: entry.content,
            timeSent: parseInt(entry.time) || Date.now(),
            read: entry.read || false,
            direction: entry.direction, // 'incoming' or 'outgoing'
            isRaw: false
        };
    }
}

/**
 * GET MAIL
 * Requires 'aliasId'. Gets all threads for that specific alias.
 */
async function getMail({ $i, userid, aliasId, threadId }) {
    if (!loggedIn($i)) return er(NO_LOGIN);
    if (!aliasId) return er({ message: "aliasId is required to fetch mail" });

    // 1. Verify Ownership
    var verified = await verifyAliasOwnership(aliasId, $i, userid);
    if (!verified) return er({ message: "You do not own this alias", code: "AUTH_FAIL" });

    // 2. Define Path: /emails/[MY_ALIAS]/threads
    var myFolder = `${aliasId}_at_awtsmoos.com`;
    var threadsPath = `/emails/${myFolder}/threads`;

    try {
        var friends = await $i.db.get(threadsPath);
        
        // If directory doesn't exist or is empty
        if (!friends || (Array.isArray(friends) && friends.length === 0)) {
            return []; 
        }

        // 'friends' is an array of filenames (e.g., "bob_at_gmail.com", "other_alias_at_awtsmoos.com")
        var allMessages = [];

        for (var friendName of friends) {
            // If user requested a specific thread (friend), skip others
            if (threadId && friendName !== threadId) continue;

            // Get the thread content (Optimized Object)
            var threadObj = await $i.db.get(`${threadsPath}/${friendName}`);
            
            if (threadObj && typeof threadObj === 'object') {
                for (var timestamp of Object.keys(threadObj)) {
                    var entry = threadObj[timestamp];
                    var uniqueId = `${friendName}:${timestamp}`;

                    // Parse and Add
                    var parsed = parseEmailEntry(entry, uniqueId, friendName);
                    parsed.correspondent = friendName; // The "Friend" (Thread ID)
                    
                    allMessages.push(parsed);
                }
            }
        }

        // Sort by time (Newest first)
        return allMessages.sort((a, b) => b.timeSent - a.timeSent);

    } catch (e) {
        return er({ message: "Error fetching threads", details: e + "" });
    }
}

/**
 * SEND MAIL
 * Unified logic for Local and Remote.
 * Writes to /threads/ folders for history.
 */
async function sendMail({ $i, userid, asAliasId, toAliasId, toEmail }) {
    if (!loggedIn($i)) return er(NO_LOGIN);

    // 1. Verify Sender Ownership
    var verified = await verifyAliasOwnership(asAliasId, $i, userid);
    if (!verified) return er({ message: "Not your alias" });

    // 2. Determine Recipient (Local Alias vs Remote Email)
    var targetEmail = "";
    var isLocal = false;

    // A. Did they provide an alias ID?
    if (toAliasId) {
        // It's local by definition
        isLocal = true;
        // Check if alias exists
        var info = await $i.db.get(`${sp}/aliases/${toAliasId}/info`);
        if (!info) return er({ message: "Recipient alias not found" });
        targetEmail = `${toAliasId}@awtsmoos.com`; 
    } 
    // B. Did they provide a raw email?
    else if (toEmail) {
        targetEmail = toEmail;
        // Check if it's actually local domain
        if (targetEmail.endsWith("@awtsmoos.com")) {
            isLocal = true;
            // Extract alias ID to verify existence? Optional.
        }
    } else {
        return er({ message: "Must provide toAliasId or toEmail" });
    }

    var subject = $i.$_POST.subject || $i.$_GET.subject || "(No Subject)";
    var content = $i.$_POST.content || $i.$_GET.content || "";
    var time = Date.now();

    // Clean names for File System
    // My Folder: me_at_awtsmoos.com
    var myFolder = `${asAliasId}_at_awtsmoos.com`; 
    // Friend Folder: target_at_domain.com
    var friendClean = targetEmail.replace("@", "_at_").replace(/[<>]/g, "");

    // 3. SENDING LOGIC
    try {
        if (isLocal) {
            // === LOCAL SEND ===
            
            // A. Write to MY Outbox (My thread with them)
            // Path: /emails/ME/threads/THEM
            await $i.db.appendToObj(`/emails/${myFolder}/threads/${friendClean}`, {
                key: time + "",
                value: {
                    from: asAliasId,
                    to: targetEmail,
                    subject,
                    content,
                    time,
                    read: true, // I read my own message
                    direction: "outgoing"
                }
            });

            // B. Write to THEIR Inbox (Their thread with me)
            // Path: /emails/THEM/threads/ME
            var meClean = `${asAliasId}_at_awtsmoos.com`;
            await $i.db.appendToObj(`/emails/${friendClean}/threads/${meClean}`, {
                key: time + "",
                value: {
                    from: asAliasId,
                    to: targetEmail,
                    subject,
                    content,
                    time,
                    read: false,
                    direction: "incoming"
                }
            });

            return { success: { message: "Sent internally" } };

        } else {
            // === REMOTE SEND ===
            
            // A. Use SMTP Client to send real email
            if ($i.mail && $i.mail.smtpClient) {
                var myFullEmail = `${asAliasId}@awtsmoos.com`;
                await $i.mail.smtpClient.sendMail(myFullEmail, targetEmail, subject, content);
            } else {
                return er({ message: "SMTP Client not available on server" });
            }

            // B. Write to MY Outbox (My thread with them) so I have history
            await $i.db.appendToObj(`/emails/${myFolder}/threads/${friendClean}`, {
                key: time + "",
                value: {
                    from: asAliasId,
                    to: targetEmail,
                    subject,
                    content,
                    time,
                    read: true,
                    direction: "outgoing"
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