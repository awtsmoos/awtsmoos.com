// B"H
/**
 * awtsmoosDynamicServer/email-ingress.js
 * Native Zero-Dependency MIME Parser & Cleaner
 */
const { TextDecoder } = require('util');

module.exports = async function ({ sender, recipients, data }) {
    try {
        var time = Date.now();
        // Path safety: sender uses _at_ for the FILENAME only
        var cleanSender = sender.replace("@", "_at_").replace(/[<>]/g, "");

        // 1. Parse the Raw Email
        var parsed = parseMime(data);

        // 2. Clean up the history (Reply chains)
        var html = stripHistory(parsed.html || "", "html");
        var text = stripHistory(parsed.text || "", "text");

        // 3. Extract Fancy Name and Clean Email from Headers
        // The header usually looks like: "Awts Moos" <awtsmoos@gmail.com>
        var rawFromHeader = parsed.headers['from'] || sender; 
        var { name, email } = parseFromHeader(rawFromHeader);

        // Fallback: if header failed, use the SMTP sender
        if(!email) email = sender;

        // 4. Fallback: If no HTML, try to make text look decent
        if (!html && text) {
            html = `<div style="white-space: pre-wrap; font-family: sans-serif;">${escapeHtml(text)}</div>`;
        }

        for (var r of recipients) {
            var cleanRecipient = r.replace("@", "_at_").replace(/[<>]/g, "");
            var path = `/emails/${cleanRecipient}/threads/${cleanSender}`;

            await this.db.appendToObj(path, {
                key: time + "",
                value: {
                    id: `${cleanSender}:${time}`, // Unique ID
                    
                    // Display Data
                    subject: parsed.subject || "(No Subject)",
                    content: html, 
                    textContent: text,
                    snippet: text.substring(0, 100),
                    attachments: parsed.attachments,
                    
                    // Sender Details
                    from: rawFromHeader,    // Full string: "Awts Moos <...>"
                    fromName: name,         // Just: "Awts Moos"
                    fromEmail: email,       // Just: "awtsmoos@gmail.com"
                    correspondent: email,   // Clean email for UI logic
                    
                    // Meta
                    time: time,
                    timeSent: time,
                    read: false,            // Explicitly set as unread
                    direction: "incoming"
                }
            });
        }
        console.log("B\"H - Saved Mail from:", name, "<" + email + ">");
    } catch ($) {
        console.log("Error saving incoming email", $);
    }
}

// --- CORE PARSER LOGIC ---

function parseMime(raw) {
    // Separate Headers from Body
    const [headerBlock, bodyBlock] = splitOnce(raw, "\r\n\r\n");
    const headers = parseHeaders(headerBlock);
    
    const contentType = headers['content-type'] || 'text/plain';
    const encoding = headers['content-transfer-encoding'] || '';
    const subject = headers['subject'] || '';

    let result = {
        headers: headers, // Pass headers back up
        text: "",
        html: "",
        attachments: [],
        subject: subject
    };

    // 1. Handle Multipart (Recursive)
    if (contentType.includes('multipart/')) {
        const boundaryMatch = contentType.match(/boundary="?([^";]+)"?/i);
        if (boundaryMatch) {
            const boundary = boundaryMatch[1];
            const parts = bodyBlock.split(`--${boundary}`);

            for (let part of parts) {
                if (part.trim() === '--' || part.trim() === '') continue;
                
                const subParsed = parseMime(part.trim());
                if (subParsed.html) result.html += subParsed.html;
                if (subParsed.text) result.text += subParsed.text;
                result.attachments = result.attachments.concat(subParsed.attachments);
            }
        }
    } 
    // 2. Handle Text/HTML
    else if (contentType.includes('text/html')) {
        result.html = decodeBody(bodyBlock, encoding);
    } 
    // 3. Handle Text/Plain
    else if (contentType.includes('text/plain')) {
        result.text = decodeBody(bodyBlock, encoding);
    }
    // 4. Handle Attachments
    else {
        const filenameMatch = headers['content-disposition']?.match(/filename="?([^";]+)"?/i);
        const filename = filenameMatch ? filenameMatch[1] : 'unknown';
        let base64Data = bodyBlock.replace(/\r\n/g, '');
        
        // Skip if it's just a boundary marker
        if(base64Data.length > 10) { 
            result.attachments.push({
                filename,
                contentType: contentType.split(';')[0],
                data: `data:${contentType.split(';')[0]};base64,${base64Data}`
            });
        }
    }

    return result;
}

// --- HELPERS ---

function parseHeaders(headerStr) {
    const headers = {};
    if (!headerStr) return headers;
    const unfolded = headerStr.replace(/\r\n[ \t]+/g, ' ');
    unfolded.split(/\r\n/).forEach(line => {
        const [key, ...vals] = line.split(':');
        if (key && vals.length) {
            headers[key.trim().toLowerCase()] = vals.join(':').trim();
        }
    });
    return headers;
}

function parseFromHeader(fromStr) {
    // Regex to handle: "Name" <email>  OR  Name <email>  OR  <email>  OR  email
    // Groups: 1=Name (in quotes), 2=Name (no quotes), 3=Email (in brackets), 4=Email (plain)
    
    // Clean up start/end
    fromStr = fromStr.trim();

    // 1. Try "Name" <email> or Name <email>
    const complex = fromStr.match(/^(?:\"?([^"<]+)\"?\s*)?<(.*)>$/);
    if (complex) {
        return {
            name: (complex[1] || "").trim().replace(/"/g, ""), 
            email: (complex[2] || "").trim()
        };
    }

    // 2. Just email
    return { name: "", email: fromStr };
}

function decodeBody(content, encoding) {
    encoding = encoding.toLowerCase().trim();
    if (encoding === 'base64') {
        return Buffer.from(content.replace(/\r\n/g, ''), 'base64').toString('utf-8');
    } 
    if (encoding === 'quoted-printable') {
        return decodeQuotedPrintable(content);
    }
    return content;
}

function decodeQuotedPrintable(str) {
    let res = str.replace(/=\r\n/g, '').replace(/=\n/g, '');
    return res.replace(/=([0-9A-F]{2})/gi, (match, hex) => String.fromCharCode(parseInt(hex, 16)));
}

function splitOnce(str, separator) {
    const i = str.indexOf(separator);
    if (i === -1) return [str, ''];
    return [str.slice(0, i), str.slice(i + separator.length)];
}

function stripHistory(content, type) {
    if (!content) return "";
    
    if (type === "html") {
        if (content.includes('class="gmail_quote"')) return content.split('<div class="gmail_quote"')[0];
        if (content.includes('<blockquote')) return content.split('<blockquote')[0];
    } else {
        const lines = content.split(/\r?\n/);
        const cleanLines = [];
        for (let line of lines) {
            if (line.match(/^>?\s*On\s.+?wrote:/i)) break;
            if (line.trim() === '--') break; 
            cleanLines.push(line);
        }
        return cleanLines.join('\n').trim();
    }
    return content;
}

function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}