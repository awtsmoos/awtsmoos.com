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


// Helper to extract Subject/From/Body from raw SMTP string
function parseRawEmailData(rawString, timeSent, idStr) {
    try {
        var parts = rawString.split("\r\n\r\n");
        // First part is headers, rest is body
        var headers = parts[0];
        var content = parts.slice(1).join("\r\n\r\n") || "";

        // Simple Regex to grab Subject and From
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
        var finalEmailList = [];
        
        // 1. Get the user's aliases to know which /emails/ folders belong to them
        var aliasPath = `${sp}/users/${userid}/aliases`;
        var userAliases = await $i.db.get(aliasPath);
        
        // If no aliases found, just return empty list (or internal mail only)
        // Don't error, just proceed.
        if (userAliases) {
            // Normalize alias list to array
            var aliasList = Array.isArray(userAliases) ? userAliases : Object.keys(userAliases);

            // 2. Iterate through each Alias (e.g., "awtsmoos")
            for (var alias of aliasList) {
                
                // Construct the folder name. 
                // e.g., "awtsmoos" -> "awtsmoos_at_awtsmoos.com"
                var folderName = `${alias}_at_awtsmoos.com`; 
                var sendersPath = `/emails/${folderName}/from`;

                // 3. Get the list of Senders (These are now FILES)
                var senders = await $i.db.get(sendersPath);

                if (Array.isArray(senders) && senders.length) {
                    for (var senderName of senders) {
                        
                        // 4. Get the specific sender's message object (Optimized Binary Object)
                        var messagesObj = await $i.db.get(`${sendersPath}/${senderName}`);
                        
                        if (messagesObj && typeof messagesObj === 'object') {
                            // 5. Loop through timestamps (keys) in this sender's file
                            for (var timestamp of Object.keys(messagesObj)) {
                                var msgData = messagesObj[timestamp];
                                
                                var compositeId = `EXT:${folderName}:${senderName}:${timestamp}`;

                                // Specific ID check
                                if (mailId && mailId === compositeId) {
                                    var parsed = parseRawEmailData(msgData.data, timestamp, compositeId);
                                    if(msgData.read) parsed.read = true;
                                    return parsed;
                                }

                                // Add to list
                                if (msgData && msgData.data) {
                                    var parsed = parseRawEmailData(msgData.data, timestamp, compositeId);
                                    if(msgData.read) parsed.read = true;
                                    finalEmailList.push(parsed);
                                }
                            }
                        }
                    }
                } 
                // If no senders, we simply continue to the next alias.
            }
        }
        
        // If a specific ID was requested but not found in external, check internal legacy
        if (mailId) {
             var internal = await $i.db.get(`${sp}/users/${userid}/mail/messages/${mailId}`);
             if(internal) return internal;

            return er({
                message: "Message not found",
                code: "NO_MSG",
                details: mailId
            });
        }

        // 6. Include Internal Legacy Mail (User-to-User)
        try {
            var op = myOpts($i);
            var internalPath = `${sp}/users/${userid}/mail/messages`;
            var internalMessages = await $i.db.get(internalPath, op);
            if (internalMessages && Array.isArray(internalMessages)) {
                 for (var k of internalMessages) {
                    var details = await $i.db.get(`${internalPath}/${k}`, op);
                    if (details) {
                        details.id = k;
                        finalEmailList.push(details);
                    }
                }
            }
        } catch(e) {}

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
    if (!loggedIn($i)) return er(NO_LOGIN);

    // Optimized External Delete
    if (mailId && mailId.startsWith("EXT:")) {
        try {
            var parts = mailId.split(":");
            var recipFolder = parts[1];
            var senderFile = parts[2];
            var timestampKey = parts[3];

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

    // Legacy Internal Delete
    var pth = `${sp}/users/${userid}/mail/messages/${mailId}`;
    try {
        await $i.db.delete(pth);
        return { success: { message: "Deleted" } };
    } catch(e) { return er({ message :"Issue", details: e+"" }) }
}

async function setEmailAsRead({
    $i,
    userid,
    mailId
}) {
    if (!loggedIn($i)) return er(NO_LOGIN);

    // Optimized External Read Mark
    if (mailId && mailId.startsWith("EXT:")) {
        var parts = mailId.split(":");
        var recipFolder = parts[1];
        var senderFile = parts[2];
        var timestampKey = parts[3];
        var path = `/emails/${recipFolder}/from/${senderFile}`;
        
        var msgData = await $i.db.getValue(path, timestampKey);
        if(!msgData) return er({ message: "Not found" });

        msgData.read = true;

        await $i.db.updateEntry(path, { key: timestampKey, value: msgData });
        
        return { success: { message: "Marked as read" } };
    }
    
    return er({ message: "Legacy read marking not implemented for this ID type" });
}

async function sendMail({
    $i,
    userid,
    asAliasId,
    toAliasId
}) {
    if (!loggedIn($i)) return er(NO_LOGIN);

    var content = $i.$_POST.content || $i.$_GET.content || "";
    var subject = $i.$_POST.subject || $i.$_GET.subject || "";
    var to = toAliasId || $i._POST.toAlias;
    
    var toAlias =  await $i.db.get(`${sp}/aliases/${to}/info`);
    if(!toAlias) return er({ message: "Recipient not found" });

    var userTo = toAlias.user;
    var timeSent = Date.now();
    var messageID = "BH_"+timeSent+"_"+(Math.floor(Math.random() * 770)) + "_from_"+asAliasId;
    
    // Writes to LEGACY path (As requested)
    await $i.db.write(`${sp}/users/${userTo}/mail/messages/${messageID}`, {
        from: asAliasId,
        to,
        timeSent,
        subject,
        content,
        dayuh: { read: false }
    });
    
    return {
        success: { message: "Sent" }
    };
}