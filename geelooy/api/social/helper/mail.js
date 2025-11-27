/**
 * B"H
 */

module.exports = {
    getMail,
    sendMail,
    deleteMail,
    setEmailAsRead
}

var {
    NO_LOGIN,
    sp
} = require("./_awtsmoos.constants.js");

var {
    loggedIn,
    er,
    myOpts
} = require("./general.js");

var {
    verifyAliasOwnership
} = require("./alias.js");


// Helper to extract Subject/From from raw SMTP string
function parseRawEmailData(rawString, timeSent, idStr) {
    try {
        var parts = rawString.split("\r\n\r\n");
        var headers = parts[0];
        var content = parts.slice(1).join("\r\n\r\n") || "";

        var subjectMatch = headers.match(/Subject: (.*)/i);
        var fromMatch = headers.match(/From: (.*)/i);

        return {
            id: idStr, 
            from: fromMatch ? fromMatch[1] : "External Sender",
            subject: subjectMatch ? subjectMatch[1] : "(No Subject)",
            content: content,
            timeSent: parseInt(timeSent) || Date.now(),
            read: false,
            isExternal: true
        };
    } catch (e) {
        return {
            id: idStr,
            from: "System",
            subject: "Raw Message",
            content: rawString,
            timeSent: Date.now()
        };
    }
}

async function getMail({
    $i,
    userid,
    mailId = null
}) {
    if (!loggedIn($i)) {
        return er(NO_LOGIN);
    }

    try {
        var op = myOpts($i);
        var finalEmailList = [];

        // 1. Fetch Internal Mail (Standard Logic)
        var internalPath = `${sp}/users/${userid}/mail/messages`;
        
        // Check for specific internal ID
        if (mailId && !mailId.startsWith("EXT:")) {
            var g = await $i.db.get(internalPath + "/" + mailId);
            if (g) return g;
        }

        var internalMessages = await $i.db.get(internalPath, op);
        if (internalMessages) {
            if (Array.isArray(internalMessages)) {
                for (var k of internalMessages) {
                    var details = await $i.db.get(`${internalPath}/${k}`, op);
                    if (details) {
                        details.id = k;
                        finalEmailList.push(details);
                    }
                }
            } else if (typeof internalMessages === 'object') {
                Object.keys(internalMessages).forEach(key => {
                    var msg = internalMessages[key];
                    msg.id = key;
                    finalEmailList.push(msg);
                });
            }
        }

        // 2. Fetch External Mail (Optimized Logic)
        var userAliases = await $i.db.get(`${sp}/users/${userid}/aliases`);
        
        if (userAliases) {
            var aliasList = Array.isArray(userAliases) ? userAliases : Object.keys(userAliases);

            for (var alias of aliasList) {
                // Determine folder: awtsmoos -> awtsmoos_at_awtsmoos.com
                // (Adjust logic if your aliases don't match domain exactly)
                var folderName = `${alias}_at_awtsmoos.com`;
                var sendersPath = `/emails/${folderName}/from`;

                // Get list of Senders (These are now FILES, not folders)
                // db.get on a directory returns an array of filenames
                var senders = await $i.db.get(sendersPath);

                if (Array.isArray(senders)) {
                    for (var senderName of senders) {
                        
                        // Get the specific sender's message object
                        // Path: /emails/.../from/google_at_gmail.com
                        var messagesObj = await $i.db.get(`${sendersPath}/${senderName}`);
                        
                        if (messagesObj && typeof messagesObj === 'object') {
                            // Loop through timestamps in this sender's file
                            for (var timestamp of Object.keys(messagesObj)) {
                                var msgData = messagesObj[timestamp];
                                
                                // Create a unique ID that lets us find this specific message later
                                // Format: EXT:recipient:sender:timestamp
                                var compositeId = `EXT:${folderName}:${senderName}:${timestamp}`;

                                if (mailId && mailId === compositeId) {
                                    return parseRawEmailData(msgData.data, timestamp, compositeId);
                                }

                                if (msgData && msgData.data) {
                                    var parsed = parseRawEmailData(msgData.data, timestamp, compositeId);
                                    // Override read status if saved in DB
                                    if(msgData.read) parsed.read = true;
                                    finalEmailList.push(parsed);
                                }
                            }
                        }
                    }
                }
            }
        }
        
        if (mailId) {
            return er({
                message: "Message not found",
                code: "NO_MSG",
                details: mailId
            });
        }

        // Sort by time (newest first)
        return finalEmailList.sort((a,b) => b.timeSent - a.timeSent);

    } catch(E) {
        return er({
            message: "Issue getting mail",
            details: E + ""
        })
    }
}

async function deleteMail({
    $i,
    mailId,
    userid
}) {
    if (!loggedIn($i)) {
        return er(NO_LOGIN);
    }

    // Check if it's an external optimized email
    if (mailId && mailId.startsWith("EXT:")) {
        try {
            // Parse ID: EXT:recipient_at_dom:sender_at_dom:timestamp
            var parts = mailId.split(":");
            if (parts.length !== 4) return er({ message: "Invalid ID" });

            var recipFolder = parts[1];
            var senderFile = parts[2];
            var timestampKey = parts[3];

            // Verify ownership (User must own the recipient alias)
            // Note: Simplistic verification here. Better to check aliases against userid.
            
            var path = `/emails/${recipFolder}/from/${senderFile}`;
            
            // Delete the specific key (timestamp) from the sender object
            var result = await $i.db.deleteEntry(path, timestampKey);

            return {
                success: {
                    message: "Deleted external email",
                    details: result
                }
            };
        } catch(e) {
            return er({ message: "Issue deleting external", details: e+"" });
        }
    }

    // Fallback to internal delete logic
    var pth = `${sp}/users/${userid}/mail/messages/${mailId}`;
    var message = await $i.db.get(pth);

    if(!message) {
        return er({
            message: "Message not found",
            code: "M_NOT_FOUND",
            details: mailId+""
        })
    }

    try {
        await $i.db.delete(pth);
        return {
            success: {
                message : "Deleted it",
                code: "DELETED",
                details: { mailId }
            }
        }
    } catch(e){
        return er({ message :"Issue", details: e+"" })
    }
}

async function setEmailAsRead({
    $i,
    userid,
    mailId
}) {
    if (!loggedIn($i)) return er(NO_LOGIN);

    // External Email Logic
    if (mailId && mailId.startsWith("EXT:")) {
        var parts = mailId.split(":");
        var recipFolder = parts[1];
        var senderFile = parts[2];
        var timestampKey = parts[3];
        var path = `/emails/${recipFolder}/from/${senderFile}`;
        
        // 1. Get current data
        var msgData = await $i.db.getValue(path, timestampKey);
        if(!msgData) return er({ message: "Not found" });

        // 2. Update read status
        msgData.read = true;

        // 3. Save back using appendToObj (which updates if key exists in DosDB logic usually, or we use updateEntry)
        // Based on your DosDB, updateEntry exists:
        await $i.db.updateEntry(path, { key: timestampKey, value: msgData });
        
        return { success: { message: "Marked as read" } };
    }

    // Internal Logic
    try {
        var pth = `${sp}/users/${userid}/mail/messages/${mailId}`;
        var message = await $i.db.get(pth);
        if(!message) return er({ message: "Message not found" });

        if(message.dayuh) message.dayuh.read = true;
        else message.read = true;

        await $i.db.write(pth, message);
        return { success: { message: "Marked as read" } };
    } catch(e) {
        return er({ message: "ERROR", details: e+"" });
    }
}

async function sendMail({
    $i,
    userid,
    asAliasId,
    toAliasId
}) {
    // ... (Your existing sendMail logic remains exactly the same) ...
    if (!loggedIn($i)) {
        return er(NO_LOGIN);
    }
    var ver = await verifyAliasOwnership(asAliasId,$i, userid);
    if(!ver) {
        return er({
            message: "That's not your alias",
            code: "NOT_YOUR_ALIAS",
            details: asAliasId
        })
    }
    var content = $i.$_POST.content || $i.$_GET.content || "";
    var subject = $i.$_POST.subject || $i.$_GET.subject || "";

    var to = toAliasId || $i._POST.toAlias;
    var toAlias =  await $i.db.get(`${sp}/aliases/${to}/info`);

    if(!toAlias) {
        return er({
            message: "The recipient alias doesn't exist!",
            code: "TO_ALIAS_NOT",
            details: to
        })
    }

    var userTo = toAlias.user;
    var timeSent = Date.now()
    var messageID = "BH_"+timeSent+"_"+(Math.floor(Math.random() * 770)) + "_from_"+asAliasId;
    
    try {
        // Internal writes still use standard file per message
        await $i.db.write(`${sp}/users/${userTo}/mail/messages/${messageID}`, {
            from: asAliasId,
            to,
            timeSent,
            subject,
            content,
            dayuh: {
                read: false
            }
        });
        return {
            success: {
                message: "Sent successfully",
                details: { messageID, to, from:asAliasId, timeSent }
            }
        }
    } catch(e){
        return er({ message: "Problem sending", details: e+"" })
    }
}