// B"H
/**
 * awtsmoosDynamicServer/email-ingress.js
 * Native Zero-Dependency MIME Parser & Cleaner
 * Fixes: Threading by Header, MIME Header Decoding, Image Embedding
 */
const { TextDecoder } = require('util');

module.exports = async function ({ sender, recipients, data }) {
    try {
        var time = Date.now();

        // 1. Parse MIME (Headers & Body)
        var parsed = parseMime(data);

        // 2. Decode MIME Headers (Fixes =?UTF-8?B?...)
        // We decode the Raw From header before parsing names out of it
        var decodedFrom = decodeMimeHeader(parsed.headers['from'] || sender);
        var decodedSubject = decodeMimeHeader(parsed.subject);

        // 3. Extract Real Sender Details
        var { name, email } = parseFromHeader(decodedFrom);
        
        // Fallback: If header parsing failed, use envelope sender
        if(!email || email.indexOf("@") === -1) email = sender;

        // 4. Generate Thread ID (Correspondent)
        // Clean logic: Extract email, swap @ -> _at_
        var cleanSender = email.replace(/[<>]/g, "").trim().replace("@", "_at_");

        // 5. Clean Content (Reply Chains)
        var html = stripHistory(parsed.html || "", "html");
        var text = stripHistory(parsed.text || "", "text");

        // 6. Embed Inline Images (cid:)
        if (html && parsed.attachments.length > 0) {
            html = embedInlineImages(html, parsed.attachments);
        }

        // 7. Text Fallback
        if (!html && text) {
            html = `<div style="white-space: pre-wrap; font-family: sans-serif;">${escapeHtml(text)}</div>`;
        }

        for (var r of recipients) {
            var cleanRecipient = r.replace("@", "_at_").replace(/[<>]/g, "");
            var path = `/emails/${cleanRecipient}/threads/${cleanSender}`;

            await this.db.appendToObj(path, {
                key: time + "",
                value: {
                    id: `${cleanSender}:${time}`,
                    
                    subject: decodedSubject || "(No Subject)",
                    content: html, 
                    textContent: text,
                    snippet: text.substring(0, 100),
                    
                    attachments: parsed.attachments.filter(a => !a.wasEmbedded),
                    
                    from: decodedFrom,
                    fromName: name,
                    fromEmail: email,       // Real Header Email
                    envelopeSender: sender, // Keep track of forwarding path
                    correspondent: cleanSender, 
                    
                    time: time,
                    timeSent: time,
                    read: false,
                    direction: "incoming"
                }
            });
            
            if (this.ws) {
                const notification = {
                    type: 'NEW_MAIL',
                    message: {
                        id: `${cleanSender}:${time}`,
                        from: decodedFrom, 
                        fromName: name,
                        subject: decodedSubject,
                        snippet: text.substring(0, 50) + "...",
                        content: html, 
                        timeSent: time,
                        correspondent: cleanSender, 
                        direction: "incoming"
                    }
                };
                this.ws.sendToAlias(cleanRecipient, notification);
            }
        }
        console.log("B\"H - Saved Mail from:", email);
    } catch ($) {
        console.log("Error saving incoming email", $);
    }
}

// --- HELPER: Decode MIME Headers (=?UTF-8?B?...) ---
function decodeMimeHeader(headerValue) {
    if (!headerValue) return "";
    return headerValue.replace(/=\?([\w-]*)\?([QqBb])\?([^?]*)\?=/g, (match, charset, encoding, text) => {
        if (encoding.toUpperCase() === 'B') {
            return Buffer.from(text, 'base64').toString('utf8');
        } else if (encoding.toUpperCase() === 'Q') {
            return decodeQuotedPrintable(text.replace(/_/g, ' '));
        }
        return match;
    });
}

// --- CORE PARSER ---

function parseMime(raw) {
    // FIX: Split robustly on double newline (Windows \r\n\r\n OR Unix \n\n)
    const splitMatch = raw.match(/\r?\n\r?\n/);
    if (!splitMatch) {
        // Fallback if no body
        return { headers: parseHeaders(raw), text: "", html: "", attachments: [], subject: "" };
    }
    
    const splitIndex = splitMatch.index;
    const headerBlock = raw.substring(0, splitIndex);
    const bodyBlock = raw.substring(splitIndex + splitMatch[0].length);
    
    const headers = parseHeaders(headerBlock);
    const contentType = headers['content-type'] || 'text/plain';
    const encoding = headers['content-transfer-encoding'] || '';
    const subject = headers['subject'] || '';

    let result = { headers, text: "", html: "", attachments: [], subject };

    // 1. Multipart
    if (contentType.includes('multipart/')) {
        const boundaryMatch = contentType.match(/boundary="?([^";]+)"?/i);
        if (boundaryMatch) {
            const boundary = boundaryMatch[1];
            const parts = bodyBlock.split(`--${boundary}`);

            for (let part of parts) {
                if (part.trim() === '--' || part.trim() === '') continue;
                // Recursion
                const subParsed = parseMime(part.trimStart()); 
                
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
    // 4. Attachments
    else {
        const cidMatch = headers['content-id'];
        const filenameMatch = headers['content-disposition']?.match(/filename="?([^";]+)"?/i);
        const filename = filenameMatch ? filenameMatch[1] : 'unknown';
        
        // Remove newlines from base64 body
        let base64Data = bodyBlock.replace(/\r?\n/g, '');
        
        if(base64Data.length > 10) { 
            result.attachments.push({
                filename,
                contentType: contentType.split(';')[0],
                contentId: cidMatch ? cidMatch.trim() : null, 
                data: `data:${contentType.split(';')[0]};base64,${base64Data}`,
                wasEmbedded: false
            });
        }
    }

    return result;
}

// --- OTHER HELPERS ---

function embedInlineImages(html, attachments) {
    return html.replace(/src=["']cid:([^"']+)["']/gi, (match, cid) => {
        const found = attachments.find(a => 
            a.contentId === cid || a.contentId === `<${cid}>` || a.contentId.includes(cid)
        );
        if (found) {
            found.wasEmbedded = true;
            return `src="${found.data}"`;
        }
        return match;
    });
}

function parseHeaders(headerStr) {
    const headers = {};
    if (!headerStr) return headers;
    
    // Unfold headers (lines starting with space belong to previous line)
    const unfolded = headerStr.replace(/\r?\n[ \t]+/g, ' ');
    
    unfolded.split(/\r?\n/).forEach(line => {
        const index = line.indexOf(':');
        if (index > -1) {
            const key = line.substring(0, index).trim().toLowerCase();
            const val = line.substring(index + 1).trim();
            headers[key] = val;
        }
    });
    return headers;
}

function parseFromHeader(fromStr) {
    if(!fromStr) return { name: "", email: "" };
    
    fromStr = fromStr.trim();
    // Match "Name <email>"
    const complex = fromStr.match(/^(?:\"?([^"<]+)\"?\s*)?<(.*)>$/);
    if (complex) {
        return {
            name: (complex[1] || "").trim().replace(/"/g, ""), 
            email: (complex[2] || "").trim()
        };
    }
    // Match just "email" (fallback)
    return { name: "", email: fromStr };
}

function decodeBody(content, encoding) {
    if (!encoding) return content;
    encoding = encoding.toLowerCase().trim();
    if (encoding === 'base64') {
        return Buffer.from(content.replace(/\r?\n/g, ''), 'base64').toString('utf-8');
    } 
    if (encoding === 'quoted-printable') {
        return decodeQuotedPrintable(content);
    }
    return content;
}

function decodeQuotedPrintable(str) {
    // 1. Remove Soft Line breaks (=\r\n or =\n)
    let clean = str.replace(/=\r?\n/g, '');
    
    // 2. Decode Hex
    let bytes = [];
    for (let i = 0; i < clean.length; i++) {
        if (clean[i] === '=') {
            const hex = clean.substr(i + 1, 2);
            if (hex.match(/^[0-9A-F]{2}$/i)) {
                bytes.push(parseInt(hex, 16));
                i += 2;
                continue;
            }
        }
        bytes.push(clean.charCodeAt(i));
    }
    return Buffer.from(bytes).toString('utf-8');
}

// stripHistory logic from previous robust version...
function stripHistory(content, type) {
    if (!content) return "";
    
    if (type === "html") {
        var markers = [
            /<div [^>]*class=["'][^"']*gmail_quote[^"']*["'][^>]*>/i,
            /<div [^>]*class=["'][^"']*yahoo_quoted[^"']*["'][^>]*>/i,
            /<div [^>]*class=["'][^"']*protonmail_quote[^"']*["'][^>]*>/i,
            /<div [^>]*id=["']divRplyFwdMsg["'][^>]*>/i,
            /<div [^>]*class=["'][^"']*moz-cite-prefix[^"']*["'][^>]*>/i,
            /<div[^>]*>\s*On\s.{5,200}?\s*wrote:\s*<br>\s*<\/div>/i,
            /<hr[^>]*>\s*<div[^>]*>\s*<b>\s*From:\s*<\/b>/i
        ];

        for (var regex of markers) {
            var match = content.match(regex);
            if (match) {
                content = content.substring(0, match.index);
                content = content.replace(/(\s*<br\s*\/?>\s*)+$/i, '');
                return content.trim();
            }
        }
        return content.trim();
    } else {
        const lines = content.split(/\r?\n/);
        const cleanLines = [];
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            if (/^>?\s*On\s.+?wrote:$/i.test(line)) break;
            if (/^[\s-]*Original Message[\s-]*$/.test(line)) break;
            if (/^[\s-]*Forwarded Message[\s-]*$/.test(line)) break;
            if (/^From:\s/.test(line)) {
                var next = lines[i+1] || "";
                if (/^Sent:\s/.test(next) || /^Date:\s/.test(next) || /^To:\s/.test(next)) break;
            }
            if (line.trim() === '--') break; 
            cleanLines.push(line);
        }
        return cleanLines.join('\n').trim();
    }
}

function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}