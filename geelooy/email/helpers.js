// B"H

/**
 * Parses text containing potentially mixed HTML and Markdown.
 * Strategy:
 * 1. Extract Code Blocks & HTML Capsules -> Placeholders
 * 2. Tokenize by HTML Tags.
 * 3. Apply Markdown only to Text Nodes.
 * 4. Restore Placeholders.
 */
export function smartParse(text) {
    if (!text) return "";
    let str = String(text);
    const blocks = [];

    // 1. Extract Code Blocks (``` ... ```)
    str = str.replace(/```(\w*)\s*([\s\S]*?)```/g, (match, lang, content) => {
        const id = `__BLK_${blocks.length}__`;
        const isHtml = (lang.toLowerCase() === 'html') || /<!DOCTYPE|<html/i.test(content);
        blocks.push({ type: isHtml ? 'capsule' : 'code', content, lang });
        return id;
    });

    // 2. Split by HTML Tags to protect attributes
    // Regex matches <tag ...> OR </tag>
    const parts = str.split(/(<[^>]+>)/g);

    const processedParts = parts.map(part => {
        if (part.startsWith('<')) return part; // It's a tag, leave it alone.
        return parseMarkdown(part); // It's text, markdownify it.
    });

    let safeHTML = processedParts.join('');

    // 3. Convert Newlines to <br> (only if not inside block tags logic, simplified here)
    // We assume the user wants newlines preserved.
    safeHTML = safeHTML.replace(/\n/g, '<br>');

    // 4. Restore Blocks
    blocks.forEach((blk, idx) => {
        let html = "";
        if (blk.type === 'capsule') {
            html = createCapsule(blk.content, idx);
        } else {
            html = `<pre class="code-block" style="background:#111;padding:10px;border-radius:8px;"><code>${escapeHtml(blk.content)}</code></pre>`;
        }
        safeHTML = safeHTML.replace(`__BLK_${idx}__`, html);
    });

    return safeHTML;
}

function parseMarkdown(text) {
    let t = text;
    // Bold
    t = t.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    // Italic
    t = t.replace(/\*(?![ ])(.*?)\*/g, '<i>$1</i>');
    // Strike
    t = t.replace(/~~(.*?)~~/g, '<s>$1</s>');
    // Links
    t = t.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    // Auto-link loose URLs (Simple)
    t = t.replace(/(^|[\s])(https?:\/\/[^\s<]+)/g, '$1<a href="$2" target="_blank">$2</a>');
    
    return t;
}

export function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function createCapsule(code, id) {
    const safeCode = encodeURIComponent(code);
    return `
    <div class="capsule" id="cap_${id}" data-code="${safeCode}">
        <div class="capsule-head" onclick="window.awtsmoosUI.peula('cap_${id}', {toggle:true})">
            <span class="capsule-title">HTML Artifact</span>
            <button class="capsule-btn" onclick="event.stopPropagation(); window.copyCode('${safeCode}')">Copy</button>
        </div>
        <iframe class="capsule-frame" srcdoc="${code.replace(/"/g, '&quot;')}" sandbox="allow-scripts allow-forms allow-popups"></iframe>
    </div>`;
}

// Global Helpers for HTML interaction
window.copyCode = (enc) => navigator.clipboard.writeText(decodeURIComponent(enc));

export function formatTime(ts) {
    return new Date(ts).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}