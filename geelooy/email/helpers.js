
// B"H

export function smartParse(text) {
    if (!text) return "";
    let str = String(text);

    // 1. Code Blocks extraction (Preserve content exactly)
    const blocks = [];
    str = str.replace(/```(\w*)\s*([\s\S]*?)```/g, (match, lang, content) => {
        const id = `__BLK_${blocks.length}__`;
        const isPage = /<!DOCTYPE html>|<html|<body/i.test(content);
        blocks.push({ content, lang, isPage });
        return id;
    });

    // 2. HTML Sanitization & Markdown
    // We do NOT escape everything. We allow safe tags.
    
    // First, escape tags we definitely don't want (script, object, etc)
    str = str.replace(/<(script|object|embed|iframe|style|link|meta)[\s\S]*?>/gi, '&lt;$1...&gt;');
    
    // Markdown Replacements (Basic)
    // Only apply markdown bold/italic if it doesn't look like an existing HTML tag
    str = str
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
        .replace(/\*(?![ ])(.*?)\*/g, '<i>$1</i>')
        .replace(/~~(.*?)~~/g, '<s>$1</s>')
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^\- (.*$)/gm, '<li>$1</li>');

    // List grouping
    str = str.replace(/(<li>.*?<\/li>(\n<li>.*?<\/li>)*)/g, '<ul>$1</ul>');

    // Linkify (Safe)
    // We use a regex that ignores things inside existing <a> tags ideally, 
    // but here we just process standard MD links.
    str = str.replace(/\[(.*?)\]\((.*?)\)/g, (match, txt, url) => {
        const safeUrl = url.trim().replace(/"/g, '&quot;');
        if (/^(?:https?:\/\/|\/|mailto:)/i.test(safeUrl)) {
            return `<a href="${safeUrl}" target="_blank">${txt}</a>`;
        }
        return `${txt} (<i>blocked link</i>)`;
    });

    // Newlines to BR, but preserve HTML structure
    // We only replace newlines that are NOT inside tags, roughly.
    // For simplicity, we just replace all \n with <br> unless it follows a block tag
    str = str.replace(/\n/g, '<br>');

    // 3. Restore Blocks
    blocks.forEach((blk, idx) => {
        let replacement = '';
        if (blk.isPage) {
            const safeContent = blk.content.replace(/"/g, '&quot;');
            replacement = `<div class="iframe-wrapper"><div class="iframe-label">HTML PREVIEW</div><iframe srcdoc="${safeContent}" class="code-iframe" sandbox="allow-scripts"></iframe></div>`;
        } else {
            // Escape inner HTML for code blocks to show raw code
            const escapedCode = blk.content.replace(/</g, '&lt;');
            replacement = `<pre><div class="code-lang">${blk.lang || 'TEXT'}</div><code>${escapedCode}</code></pre>`;
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
