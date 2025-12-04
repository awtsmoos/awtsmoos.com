
// B"H

export function smartParse(text) {
    if (!text) return "";
    let str = String(text);
    
    // Safety: If it looks like full HTML, just return it sanitized (simplified)
    if(str.trim().startsWith('<') && str.includes('>')) return str;

    // 1. Code Blocks
    const blocks = [];
    str = str.replace(/```(\w*)\s*([\s\S]*?)```/g, (match, lang, content) => {
        const id = `__BLK_${blocks.length}__`;
        blocks.push({ content, lang });
        return id;
    });

    // 2. Markdown Parsing
    str = str
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
        .replace(/\*(?![ ])(.*?)\*/g, '<i>$1</i>')
        .replace(/~~(.*?)~~/g, '<s>$1</s>')
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^\- (.*$)/gm, '<li>$1</li>')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
        .replace(/\n/g, '<br>');

    // List wrapping
    str = str.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>').replace(/<\/ul><br><ul>/g, '');

    // 3. Restore Blocks
    blocks.forEach((blk, idx) => {
        str = str.replace(`__BLK_${idx}__`, `<pre><code>${blk.content}</code></pre>`);
    });

    return str;
}

export function htmlToMarkdown(html) {
    let temp = document.createElement('div');
    temp.innerHTML = html;

    // Simple DOM walker to convert to MD
    // Replace formatting
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
