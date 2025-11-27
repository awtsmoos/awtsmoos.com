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

async function getMail({ $i, userid, aliasId, threadId }) {
    if (!loggedIn($i)) return er(NO_LOGIN);
    if (!aliasId) return er({
	    message: "aliasId is required to fetch mail",
	    GET: $i.$_GET
    });

    var verified = await verifyAliasOwnership(aliasId, $i, userid);
    if (!verified) return er({ message: "You do not own this alias", code: "AUTH_FAIL" });

    var myFolder = `${aliasId}_at_awtsmoos.com`;
    var threadsPath = `/emails/${myFolder}/threads`;

    try {
        var friends = await $i.db.get(threadsPath);
        
        if (!friends || (Array.isArray(friends) && friends.length === 0)) {
            return []; 
        }

        var allMessages = [];

        for (var friendName of friends) {
            if (threadId && friendName !== threadId) continue;

            var threadObj = await $i.db.get(`${threadsPath}/${friendName}`);
            
            if (threadObj && typeof threadObj === 'object') {
                for (var timestamp of Object.keys(threadObj)) {
                    var entry = threadObj[timestamp];
                    var uniqueId = `${friendName}:${timestamp}`;

                    var parsed = parseEmailEntry(entry, uniqueId, friendName);
                    parsed.correspondent = friendName;
                    
                    allMessages.push(parsed);
                }
            }
        }

        // B"H
        // Oldest first (a - b) so conversation flows down
        return allMessages.sort((a, b) => a.timeSent - b.timeSent);

    } catch (e) {
        return er({ message: "Error fetching threads", details: e + "" });
    }
}


// Copy the rest of the file from your previous version, just ensure `getMail` uses a.timeSent - b.timeSent
async function sendMail({ $i, userid, asAliasId, toAliasId, toEmail }) {
    if (!loggedIn($i)) return er(NO_LOGIN);

    // 1. Verify Sender Ownership
    var verified = await verifyAliasOwnership(asAliasId, $i, userid);
    if (!verified) return er({ message: "Not your alias", code: "AUTH_FAIL" });

    // 2. Determine Recipient (Local Alias vs Remote Email)
    var targetEmail = "";
    var isLocal = false;
    var friendClean = "";

    // Helper to check local alias existence
    var checkLocal = async (id) => await $i.db.get(`${sp}/aliases/${id}/info`);

    if (toAliasId) {
        // Case A: Passed as a URL param (e.g. /sendTo/some_id)
        
        // 1. Try treating it as a local alias ID first
        var info = await checkLocal(toAliasId);
        
        if (info) {
            // It IS a local alias
            isLocal = true;
            targetEmail = `${toAliasId}@awtsmoos.com`;
            friendClean = `${toAliasId}_at_awtsmoos.com`;
        } else {
            // It is NOT a local alias.
            // Check if it's a file-safe external address (e.g. user_at_gmail.com)
            // This happens when replying to a thread ID.
            if (toAliasId.includes("_at_")) {
                isLocal = false;
                // Revert to email format (replace first _at_ with @)
                targetEmail = toAliasId.replace("_at_", "@");
                friendClean = toAliasId;
            } 
            // Check if it's a raw email passed in the URL path (bad practice but possible)
            else if (toAliasId.includes("@")) {
                isLocal = false;
                targetEmail = toAliasId;
                friendClean = toAliasId.replace("@", "_at_").replace(/[<>]/g, "");
            }
            else {
                return er({ message: "Recipient alias not found", code: "RCPT_NOT_FOUND" });
            }
        }
    } 
    else if (toEmail) {
        // Case B: Passed via query/body (e.g. ?toEmail=user@gmail.com)
        targetEmail = toEmail;
        friendClean = targetEmail.replace("@", "_at_").replace(/[<>]/g, "");
        
        // Optional: Check if it's actually our domain (awtsmoos.com) to force internal handling
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

    // Clean Sender Folder: me_at_awtsmoos.com
    var myFolder = `${asAliasId}_at_awtsmoos.com`; 

    // 3. SENDING LOGIC
    try {
        if (isLocal) {
            // === LOCAL SEND ===
            
            // A. Write to MY Outbox
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

            // B. Write to THEIR Inbox
            // Note: friendClean is already set to recipient_at_awtsmoos.com for local
            // We need to name the file in THEIR folder as MY identifier
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
            
            // A. Use SMTP Client
            if ($i.mail && $i.mail.smtpClient) {
                var myFullEmail = `${asAliasId}@awtsmoos.com`;
                
                console.log(`B"H - SMTP Sending: ${myFullEmail} -> ${targetEmail}`);

                // B"H - FIX: Add Timeout Wrapper
                // If SMTP takes longer than 10 seconds, fail gracefully instead of hanging forever
                const sendTask = $i.mail.smtpClient.sendMail(myFullEmail, targetEmail, subject, content);
                
                const timeoutTask = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error("SMTP Timeout: Remote server did not respond in 10s.")), 10000)
                );

                await Promise.race([sendTask, timeoutTask]);

            } else {
                return er({ message: "SMTP Client not available on server" });
            }

            // B. Write to MY Outbox (My thread with them)
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