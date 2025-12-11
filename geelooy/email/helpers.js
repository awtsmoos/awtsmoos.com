
// B"H

export function smartParse(text) {
    if (!text) return "";
    let str = String(text);
    
    // SECURITY UPDATE: Removed the check that allowed raw HTML pass-through.
    // We now parse everything to ensure safety.

    // 1. Code Blocks & Iframe Detection
    const blocks = [];
    str = str.replace(/```(\w*)\s*([\s\S]*?)```/g, (match, lang, content) => {
        const id = `__BLK_${blocks.length}__`;
        
        // CHECK: Is this a full HTML page?
        const isPage = /<!DOCTYPE html>|<html|<body/i.test(content);
        
        blocks.push({ content, lang, isPage });
        return id;
    });

    // 2. Markdown Parsing
    str = str
        // Escape raw HTML tags in text to prevent XSS before markdown rendering
        .replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
        .replace(/\*(?![ ])(.*?)\*/g, '<i>$1</i>')
        .replace(/~~(.*?)~~/g, '<s>$1</s>')
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        // List wrapping (Moved BEFORE newline conversion)
        .replace(/^\- (.*$)/gm, '<li>$1</li>');

    // Group Lists
    str = str.replace(/(<li>.*?<\/li>(\n<li>.*?<\/li>)*)/g, '<ul>$1</ul>');

    // Now process links and newlines
    str = str
        // SECURITY FIX: Sanitize Links to prevent javascript: execution
        .replace(/\[(.*?)\]\((.*?)\)/g, (match, txt, url) => {
            const safeUrl = url.trim();
            // Only allow http, https, or relative paths. Block javascript: data: vbscript: etc.
            if (/^(?:https?:\/\/|\/|mailto:)/i.test(safeUrl)) {
                return `<a href="${safeUrl}" target="_blank">${txt}</a>`;
            }
            return `${txt} (<i>blocked link</i>)`;
        })
        .replace(/\n/g, '<br>');

    // 3. Restore Blocks with specialized rendering
    blocks.forEach((blk, idx) => {
        let replacement = '';
        if (blk.isPage) {
            // Renders as an IFRAME
            const safeContent = blk.content.replace(/"/g, '&quot;');
            replacement = `<div class="iframe-wrapper"><div class="iframe-label">HTML PREVIEW</div><iframe srcdoc="${safeContent}" class="code-iframe" sandbox="allow-scripts"></iframe></div>`;
        } else {
            // Renders as standard code block
            // Note: We don't escape < here because we did it globally earlier, but we need to ensure code content is clean.
            // Since we extracted blocks BEFORE global escape, we need to escape them now.
            replacement = `<pre><div class="code-lang">${blk.lang || 'TEXT'}</div><code>${blk.content.replace(/</g, '&lt;')}</code></pre>`;
        }
        str = str.replace(`__BLK_${idx}__`, replacement);
    });

    return str;
}

export function markdownToHtml(md) {
    if(!md) return "";
    let html = md
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
        .replace(/\*(.*?)\*/g, '<i>$1</i>')
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/\n/g, '<br>');
    return html;
}

export function htmlToMarkdown(html) {
    let temp = document.createElement('div');
    temp.innerHTML = html;

    // Simple DOM walker to convert to MD
    const replacements = [
        { sel: 'b, strong', fn: (el) => `**${el.innerHTML}**` },
        { sel: 'i, em', fn: (el) => `*${el.innerHTML}*` },
        { sel: 's, strike', fn: (el) => `~~${el.innerHTML}~~` },
        { sel: 'h1', fn: (el) => `# ${el.innerHTML}\n` },
        { sel: 'h2', fn: (el) => `## ${el.innerHTML}\n` },
        { sel: 'li', fn: (el) => `- ${el.innerHTML}\n` },
        { sel: 'div, p', fn: (el) => `${el.innerHTML}\n` },
        { sel: 'br', fn: () => '\n' },
        { sel: 'a', fn: (el) => `[${el.innerText}](${el.href})` }
    ];

    replacements.forEach(r => {
        temp.querySelectorAll(r.sel).forEach(el => {
            el.outerHTML = r.fn(el);
        });
    });

    return temp.innerText.trim();
}

export function formatTime(ts) {
    return new Date(ts).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}
