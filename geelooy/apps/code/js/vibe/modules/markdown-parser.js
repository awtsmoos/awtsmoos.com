
// B"H
// FILE: js/vibe/modules/markdown-parser.js

export const MarkdownParser = {
    /**
     * B"H - Lexes and Parses markdown text into HTML.
     */
    parse(text) {
        if (!text) return '';
        const tokens = this.lex(text);
        return this.render(tokens);
    },

    lex(text) {
        const tokens = [];
        let src = text.replace(/\r\n/g, '\n');

        while (src) {
            // CODE BLOCKS (```)
            let match = src.match(/^```(\w*)\n?([^]*?)```/);
            if (match) {
                tokens.push({ type: 'code', lang: match[1] || 'text', text: match[2] });
                src = src.substring(match[0].length);
                continue;
            }

            // HEADERS (#)
            match = src.match(/^(#{1,6}) (.*)(?:\n|$)/);
            if (match) {
                tokens.push({ type: 'header', level: match[1].length, text: match[2] });
                src = src.substring(match[0].length);
                continue;
            }
            
            // B"H - IMPROVEMENT 9: TABLES (| Column | Column |)
            match = src.match(/^\|(.+)\|\n\|([-:| ]+)\|\n((\|.*\|\n?)*)/);
            if (match) {
                tokens.push({ type: 'table', header: match[1], align: match[2], rows: match[3] });
                src = src.substring(match[0].length);
                continue;
            }

            // LISTS (unordered)
            match = src.match(/^(\s*[-*] .*(\n\s*[-*] .*)*)(?:\n|$)/);
            if (match) {
                tokens.push({ type: 'list', text: match[1] });
                src = src.substring(match[0].length);
                continue;
            }

            // TEXT (Paragraphs)
            let nextIndex = src.search(/(^```|^#{1,6} |^\s*[-*] |^\|.*\|)/m);
            
            if (nextIndex === -1) {
                tokens.push({ type: 'text', text: src });
                src = '';
            } else if (nextIndex === 0) {
                tokens.push({ type: 'text', text: src[0] });
                src = src.substring(1);
            } else {
                tokens.push({ type: 'text', text: src.substring(0, nextIndex) });
                src = src.substring(nextIndex);
            }
        }
        return tokens;
    },

    render(tokens) {
        return tokens.map(token => {
            switch (token.type) {
                case 'code':
                    return this.renderCodeBlock(token.lang, token.text);
                case 'header':
                    return `<h${token.level} class="vibe-md-h${token.level}">${this.parseInline(token.text)}</h${token.level}>`;
                case 'table':
                    return this.renderTable(token);
                case 'list':
                    const items = token.text.split('\n').map(line => {
                        const content = line.replace(/^\s*[-*] /, '');
                        return `<li>${this.parseInline(content)}</li>`;
                    }).join('');
                    return `<ul class="vibe-md-list">${items}</ul>`;
                case 'text':
                    return token.text.split(/\n\s*\n/).map(p => {
                        const trim = p.trim();
                        return trim ? `<div class="vibe-md-paragraph">${this.parseInline(trim)}</div>` : '';
                    }).join('');
                default:
                    return '';
            }
        }).join('');
    },

    renderTable(token) {
        const hCols = token.header.split('|').filter(c => c.trim()).map(c => `<th>${this.parseInline(c.trim())}</th>`).join('');
        const rowsHtml = token.rows.split('\n').filter(r => r.trim()).map(row => {
            const cols = row.split('|').filter(c => c.trim() || c === '').slice(1, -1);
            return `<tr>${cols.map(c => `<td>${this.parseInline(c.trim())}</td>`).join('')}</tr>`;
        }).join('');
        
        return `
        <div style="overflow-x:auto; margin: 10px 0;">
            <table style="width:100%; border-collapse:collapse; border:1px solid var(--color-border); font-size:0.9em;">
                <thead style="background:rgba(255,255,255,0.05); text-align:left;"><tr>${hCols}</tr></thead>
                <tbody>${rowsHtml}</tbody>
            </table>
        </div>`;
    },

    parseInline(text) {
        let html = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        html = html.replace(/`([^`]+)`/g, '<span class="vibe-md-inline-code">$1</span>');
        html = html.replace(/\*\*(.*?)\*\*/g, '<span class="vibe-md-strong">$1</span>');
        html = html.replace(/\*(.*?)\*/g, '<span class="vibe-md-em">$1</span>');
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color:var(--neon-cyan);text-decoration:underline;">$1</a>');
        return html;
    },

    renderCodeBlock(lang, code) {
        const safeCode = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const encodedCode = encodeURIComponent(code);
        return `
            <div class="vibe-code-container" data-lang="${lang}">
                <div class="vibe-code-header">
                    <span>${lang}</span>
                    <button class="vibe-copy-btn" onclick="navigator.clipboard.writeText(decodeURIComponent('${encodedCode}')); this.innerHTML='<span>✓</span> Copied'; setTimeout(()=>this.innerHTML='Copy', 1500);">
                        Copy
                    </button>
                </div>
                <pre class="vibe-md-code-block"><code>${safeCode}</code></pre>
            </div>
        `;
    }
};
