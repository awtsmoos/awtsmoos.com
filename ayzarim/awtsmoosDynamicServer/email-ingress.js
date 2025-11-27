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
            
            if (this.ws) {
		    // Construct a safe payload (similar to API response)
		    const notification = {
		        type: 'NEW_MAIL',
		        message: {
		            id: `${cleanSender}:${time}`,
		            from: rawFromHeader,
		            fromName: name,
		            subject: parsed.subject,
		            snippet: text.substring(0, 50) + "...",
		            timeSent: time,
		            correspondent: cleanSender,
		            direction: "incoming"
		        }
		    };
		    
		    // Send to recipient (e.g. "me_at_awtsmoos.com")
		    this.ws.sendToAlias(cleanRecipient, notification);
		}
		
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
    // 1. Remove Soft Line breaks (=\r\n)
    let clean = str.replace(/=\r\n/g, '').replace(/=\n/g, '');
    
    // 2. Convert raw string to bytes
    // If we just do replace() with String.fromCharCode, we break multi-byte chars (like Â).
    // We must collect bytes and let Buffer handle the UTF-8 decoding.
    let bytes = [];
    
    for (let i = 0; i < clean.length; i++) {
        if (clean[i] === '=') {
            // Check if next 2 chars are hex
            const hex = clean.substr(i + 1, 2);
            if (hex.match(/^[0-9A-F]{2}$/i)) {
                bytes.push(parseInt(hex, 16));
                i += 2; // skip the hex digits
                continue;
            }
        }
        // Push the regular char code
        bytes.push(clean.charCodeAt(i));
    }

    // 3. Decode the byte array as UTF-8
    return Buffer.from(bytes).toString('utf-8');
}

function splitOnce(str, separator) {
    const i = str.indexOf(separator);
    if (i === -1) return [str, ''];
    return [str.slice(0, i), str.slice(i + separator.length)];
}

function stripHistory(content, type) {
    if (!content) return "";
    
    if (type === "html") {
        // STRATEGY: Find the "Cut Line" and discard everything after it.
        // This handles infinite nesting because we cut the root of the history tree.

        var markers = [
            // 1. Gmail (The most common)
            // Matches <div class="gmail_quote"> or <div class="gmail_quote gmail_quote_container">
            /<div [^>]*class=["'][^"']*gmail_quote[^"']*["'][^>]*>/i,

            // 2. Yahoo Mail
            /<div [^>]*class=["'][^"']*yahoo_quoted[^"']*["'][^>]*>/i,

            // 3. ProtonMail
            /<div [^>]*class=["'][^"']*protonmail_quote[^"']*["'][^>]*>/i,

            // 4. Outlook / Hotmail (Web)
            // Often uses ID="divRplyFwdMsg"
            /<div [^>]*id=["']divRplyFwdMsg["'][^>]*>/i,

            // 5. Thunderbird / Mozilla
            /<div [^>]*class=["'][^"']*moz-cite-prefix[^"']*["'][^>]*>/i,

            // 6. Generic "On ... wrote:" HTML block
            // Looks for: <div>On ... wrote:<br></div>
            // We use a stricter regex here to avoid false positives in normal text
            /<div[^>]*>\s*On\s.{5,200}?\s*wrote:\s*<br>\s*<\/div>/i,

            // 7. Outlook Hr + From
            /<hr[^>]*>\s*<div[^>]*>\s*<b>\s*From:\s*<\/b>/i
        ];

        for (var regex of markers) {
            var match = content.match(regex);
            if (match) {
                // Get the content BEFORE the history marker
                content = content.substring(0, match.index);
                
                // B"H
                // - CLEANUP ORPHANS
                // Remove trailing <br> tags that were separators
                content = content.replace(/(\s*<br\s*\/?>\s*)+$/i, '');
                
                return content.trim();
            }
        }

        return content.trim();

    } else {
        // --- TEXT MODE ---
        // Splits by line and looks for common signature/reply patterns
        const lines = content.split(/\r?\n/);
        const cleanLines = [];
        
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            
            // 1. "On ... wrote:"
            if (/^>?\s*On\s.+?wrote:$/i.test(line)) break;
            
            // 2. Outlook dividers
            if (/^[\s-]*Original Message[\s-]*$/.test(line)) break;
            if (/^[\s-]*Forwarded Message[\s-]*$/.test(line)) break;
            
            // 3. Header Block (From: ... Sent: ...)
            if (/^From:\s/.test(line)) {
                // Peek ahead to confirm it's a header block and not just a sentence starting with "From:"
                var next = lines[i+1] || "";
                if (/^Sent:\s/.test(next) || /^Date:\s/.test(next) || /^To:\s/.test(next)) break;
            }

            // 4. Common Mobile Signatures (Optional - remove if you want to keep them)
            if (/^Sent from my (iPhone|Android|Galaxy|iPad)/i.test(line)) break;
            if (/^Get Outlook for/i.test(line)) break;

            // 5. Standard Signature Delimiter "-- "
            if (line.trim() === '--') break; 

            cleanLines.push(line);
        }
        return cleanLines.join('\n').trim();
    }
}

function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}