// B"H
/**
 * awtsmoosDynamicServer/email-ingress.js
 * Native Zero-Dependency MIME Parser & Cleaner
 * NOW WITH CID IMAGE EMBEDDING
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

        // 3. EMBED INLINE IMAGES (Fix for cid: attachments)
        // If the HTML has <img src="cid:..."> we find the matching attachment and inject base64
        if (html && parsed.attachments.length > 0) {
            html = embedInlineImages(html, parsed.attachments);
        }

        // 4. Extract Fancy Name and Clean Email
        var rawFromHeader = parsed.headers['from'] || sender; 
        var { name, email } = parseFromHeader(rawFromHeader);
        if(!email) email = sender;

        // 5. Fallback for text-only emails
        if (!html && text) {
            html = `<div style="white-space: pre-wrap; font-family: sans-serif;">${escapeHtml(text)}</div>`;
        }

        for (var r of recipients) {
            var cleanRecipient = r.replace("@", "_at_").replace(/[<>]/g, "");
            var path = `/emails/${cleanRecipient}/threads/${cleanSender}`;

            // Save to DB
            await this.db.appendToObj(path, {
                key: time + "",
                value: {
                    id: `${cleanSender}:${time}`,
                    
                    subject: parsed.subject || "(No Subject)",
                    content: html, 
                    textContent: text,
                    snippet: text.substring(0, 100),
                    
                    // Filter out attachments that were embedded (optional, but keeps DB smaller)
                    // We keep non-inline attachments (pdfs, zips, etc)
                    attachments: parsed.attachments.filter(a => !a.wasEmbedded),
                    
                    from: rawFromHeader,
                    fromName: name,
                    fromEmail: email,
                    correspondent: email,
                    
                    time: time,
                    timeSent: time,
                    read: false,
                    direction: "incoming"
                }
            });
        }
        console.log("B\"H - Saved Mail with Attachments from:", name);
    } catch ($) {
        console.log("Error saving incoming email", $);
    }
}

// --- LOGIC: Embed CID Images ---

function embedInlineImages(html, attachments) {
    // Regex to find src="cid:..."
    return html.replace(/src=["']cid:([^"']+)["']/gi, (match, cid) => {
        // Find attachment with matching Content-ID
        // Note: Content-ID usually has brackets <...>, the HTML cid usually does not.
        const found = attachments.find(a => 
            a.contentId === cid || 
            a.contentId === `<${cid}>` ||
            a.contentId.includes(cid)
        );

        if (found) {
            found.wasEmbedded = true; // Mark as used so we don't show it as a download button later
            return `src="${found.data}"`;
        }
        return match; // Return original if not found
    });
}

// --- CORE PARSER LOGIC ---

function parseMime(raw) {
    const [headerBlock, bodyBlock] = splitOnce(raw, "\r\n\r\n");
    const headers = parseHeaders(headerBlock);
    
    const contentType = headers['content-type'] || 'text/plain';
    const encoding = headers['content-transfer-encoding'] || '';
    const subject = headers['subject'] || '';

    let result = {
        headers: headers,
        text: "",
        html: "",
        attachments: [],
        subject: subject
    };

    // 1. Multipart
    if (contentType.includes('multipart/')) {
        const boundaryMatch = contentType.match(/boundary="?([^";]+)"?/i);
        if (boundaryMatch) {
            const boundary = boundaryMatch[1];
            // Split parts
            const parts = bodyBlock.split(`--${boundary}`);

            for (let part of parts) {
                if (part.trim() === '--' || part.trim() === '') continue;
                
                const subParsed = parseMime(part.trim()); // Recursive
                
                if (subParsed.html) result.html += subParsed.html;
                if (subParsed.text) result.text += subParsed.text;
                result.attachments = result.attachments.concat(subParsed.attachments);
            }
        }
    } 
    // 2. HTML
    else if (contentType.includes('text/html')) {
        result.html = decodeBody(bodyBlock, encoding);
    } 
    // 3. Plain Text
    else if (contentType.includes('text/plain')) {
        result.text = decodeBody(bodyBlock, encoding);
    }
    // 4. Attachments / Images
    else {
        // Grab Content-ID if it exists (for inline images)
        const cidMatch = headers['content-id'];
        
        const filenameMatch = headers['content-disposition']?.match(/filename="?([^";]+)"?/i);
        const filename = filenameMatch ? filenameMatch[1] : 'unknown';
        
        let base64Data = bodyBlock.replace(/\r\n/g, '');
        
        if(base64Data.length > 10) { 
            result.attachments.push({
                filename,
                contentType: contentType.split(';')[0],
                contentId: cidMatch ? cidMatch.trim() : null, // Store CID
                data: `data:${contentType.split(';')[0]};base64,${base64Data}`,
                wasEmbedded: false
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
    fromStr = fromStr.trim();
    const complex = fromStr.match(/^(?:\"?([^"<]+)\"?\s*)?<(.*)>$/);
    if (complex) {
        return {
            name: (complex[1] || "").trim().replace(/"/g, ""), 
            email: (complex[2] || "").trim()
        };
    }
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
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}