// B"H
/**
 * awtsmoosDynamicServer/email-ingress.js
 * Native Zero-Dependency MIME Parser & Cleaner
 */
const { TextDecoder } = require('util');

module.exports = async function ({ sender, recipients, data }) {
    try {
        var time = Date.now();
        var cleanSender = sender.replace("@", "_at_").replace(/[<>]/g, "");

        // 1. Parse the Raw Email
        var parsed = parseMime(data);

        // 2. Clean up the history (Reply chains)
        var html = stripHistory(parsed.html || "", "html");
        var text = stripHistory(parsed.text || "", "text");

        // 3. Fallback: If no HTML, try to make text look decent
        if (!html && text) {
            html = `<div style="white-space: pre-wrap; font-family: sans-serif;">${escapeHtml(text)}</div>`;
        }

        for (var r of recipients) {
            var cleanRecipient = r.replace("@", "_at_").replace(/[<>]/g, "");
            var path = `/emails/${cleanRecipient}/threads/${cleanSender}`;

            await this.db.appendToObj(path, {
                key: time + "",
                value: {
                    // Store the CLEANED versions
                    subject: parsed.subject || "(No Subject)",
                    content: html, 
                    textContent: text,
                    snippet: text.substring(0, 100),
                    attachments: parsed.attachments,
                    
                    time: time,
                    read: false,
                    direction: "incoming",
                    correspondent: cleanSender,
                    
                    // Keep raw just in case, or delete to save space
                    // rawData: data 
                }
            });
        }
        console.log("B\"H - Parsed & Saved Incoming Email:", sender);
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
                // Ignore empty preamble/epilogue
                if (part.trim() === '--' || part.trim() === '') continue;
                
                // Recurse
                const subParsed = parseMime(part.trim());
                
                // Merge results
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
    // 4. Handle Attachments (Images, etc)
    else {
        // It's a binary attachment
        // We probably want to convert it to a Data URI for the client
        const filenameMatch = headers['content-disposition']?.match(/filename="?([^";]+)"?/i);
        const filename = filenameMatch ? filenameMatch[1] : 'unknown';
        
        // Simple Base64 handling
        let base64Data = bodyBlock.replace(/\r\n/g, '');
        result.attachments.push({
            filename,
            contentType: contentType.split(';')[0],
            data: `data:${contentType.split(';')[0]};base64,${base64Data}`
        });
    }

    return result;
}

// --- HELPERS ---

function parseHeaders(headerStr) {
    const headers = {};
    if (!headerStr) return headers;
    
    // Unfold folded headers (lines starting with space/tab)
    const unfolded = headerStr.replace(/\r\n[ \t]+/g, ' ');
    
    unfolded.split(/\r\n/).forEach(line => {
        const [key, ...vals] = line.split(':');
        if (key && vals.length) {
            headers[key.trim().toLowerCase()] = vals.join(':').trim();
        }
    });
    return headers;
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
    // 1. Remove Soft Line breaks (=\r\n)
    let res = str.replace(/=\r\n/g, '').replace(/=\n/g, '');
    
    // 2. Decode =XX hex codes
    return res.replace(/=([0-9A-F]{2})/gi, function(match, hex) {
        return String.fromCharCode(parseInt(hex, 16));
    });
}

// Split string only on the first occurrence
function splitOnce(str, separator) {
    const i = str.indexOf(separator);
    if (i === -1) return [str, ''];
    return [str.slice(0, i), str.slice(i + separator.length)];
}

function stripHistory(content, type) {
    if (!content) return "";
    
    if (type === "html") {
        // 1. Gmail Standard
        if (content.includes('class="gmail_quote"')) {
            return content.split('<div class="gmail_quote"')[0];
        }
        // 2. Generic Blockquote reply
        if (content.includes('<blockquote')) {
            // Only cut if it looks like a trailing reply block
            return content.split('<blockquote')[0];
        }
        // 3. "On ... wrote:" patterns in HTML
        // This is harder in regex, but we can look for the div wrapper
        const onWroteRegex = /On\s.*?wrote:/i;
        if(onWroteRegex.test(content)) {
             // Aggressive cut? Maybe too risky without DOM parser.
             // Relying on gmail_quote class is safer for Gmail.
        }
    } else {
        // Text cleaning
        // 1. Cut at "On ... wrote:"
        const lines = content.split(/\r?\n/);
        const cleanLines = [];
        for (let line of lines) {
            if (line.match(/^>?\s*On\s.+?wrote:/i)) break;
            if (line.trim() === '--') break; // Signature divider
            cleanLines.push(line);
        }
        return cleanLines.join('\n').trim();
    }
    
    return content;
}

function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}