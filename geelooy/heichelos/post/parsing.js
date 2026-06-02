//B"H
/**
 * @file parsing.js
 * @description
 * The Scribe of Awtsmoos. 
 * Converts raw text (Dayuh) into the HTML vessels of the browser (Otiyot).
 * Handles:
 * - Headers (#, ##)
 * - Lists (-, *, 1.) with nesting
 * - Blockquotes (>)
 * - Code Blocks (```)
 * - Inline Styles (**, *, `)
 * - Links (Intelligent routing)
 */

import { isFirstCharacterHebrew } from "/heichelos/post/functions/utils.js";

/**
 * Main parser entry point.
 */
export function markdownToHtml(markdown) {
    if (!markdown) return "";

    // 1. Normalize line endings
    let src = markdown.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    // 2. Extract Code Blocks to protect them from processing
    const codeBlocks = [];
    src = src.replace(/^```(\w*)\n([\s\S]*?)```/gm, (match, lang, code) => {
        const id = `__CODE_BLOCK_${codeBlocks.length}__`;
        codeBlocks.push({ lang, code, match });
        return id; // Placeholder
    });

    // 3. Process Blocks line by line
    const lines = src.split("\n");
    let html = "";
    let state = "NORMAL"; // NORMAL, UL, OL, BLOCKQUOTE
    let listStack = []; // Track nesting level
    
    const closeList = () => {
        while (listStack.length > 0) {
            html += `</li></${listStack.pop()}>`;
        }
        state = "NORMAL";
    };

    const closeBlockquote = () => {
        if (state === "BLOCKQUOTE") {
            html += "</blockquote>";
            state = "NORMAL";
        }
    };

    lines.forEach((line, index) => {
        // --- Lists (Unordered) ---
        // Matches "- item" or "* item"
        const ulMatch = line.match(/^(\s*)([-*])\s+(.*)/);
        if (ulMatch) {
            closeBlockquote();
            const indent = ulMatch[1].length;
            const content = parseInline(ulMatch[3]);
            
            // Check nesting based on indentation (2 spaces approx per level)
            const level = Math.floor(indent / 2); 
            
            if (state !== "UL" && state !== "OL") {
                state = "UL";
                listStack.push("ul");
                html += "<ul><li>" + content;
            } else {
                const currentLevel = listStack.length - 1;
                if (level > currentLevel) {
                    listStack.push("ul");
                    html += "<ul><li>" + content;
                } else if (level < currentLevel) {
                    while (listStack.length - 1 > level) {
                        html += `</li></${listStack.pop()}>`;
                    }
                    html += "</li><li>" + content;
                } else {
                    html += "</li><li>" + content;
                }
            }
            return;
        }

        // --- Lists (Ordered) ---
        // Matches "1. item"
        const olMatch = line.match(/^(\s*)(\d+)\.\s+(.*)/);
        if (olMatch) {
            closeBlockquote();
            const indent = olMatch[1].length;
            const content = parseInline(olMatch[3]);
            const level = Math.floor(indent / 2);

            if (state !== "UL" && state !== "OL") {
                state = "OL";
                listStack.push("ol");
                html += "<ol><li>" + content;
            } else {
                const currentLevel = listStack.length - 1;
                if (level > currentLevel) {
                    listStack.push("ol");
                    html += "<ol><li>" + content;
                } else if (level < currentLevel) {
                    while (listStack.length - 1 > level) {
                        html += `</li></${listStack.pop()}>`;
                    }
                    html += "</li><li>" + content;
                } else {
                    html += "</li><li>" + content;
                }
            }
            return;
        }

        // If we are here, we are NOT in a list item line.
        closeList();

        // --- Headers ---
        const headerMatch = line.match(/^(#{1,6})\s+(.*)/);
        if (headerMatch) {
            closeBlockquote();
            const level = headerMatch[1].length;
            const text = parseInline(headerMatch[2]);
            const dirClass = isFirstCharacterHebrew(text) ? ' class="heb"' : '';
            html += `<h${level}${dirClass}>${text}</h${level}>`;
            return;
        }

        // --- Blockquotes ---
        const bqMatch = line.match(/^>\s+(.*)/);
        if (bqMatch) {
            if (state !== "BLOCKQUOTE") {
                state = "BLOCKQUOTE";
                html += "<blockquote>";
            }
            html += parseInline(bqMatch[1]) + "<br>";
            return;
        }
        
        closeBlockquote();

        // --- Horizontal Rule ---
        if (line.match(/^---$/) || line.match(/^\*\*\*$/)) {
            html += "<hr>";
            return;
        }

        // --- Empty Line ---
        if (line.trim() === "") {
            // Keep empty lines as spacers if needed, or ignore
            // For now, we'll insert a break if previous wasn't a block end
            return; 
        }

        // --- Paragraphs ---
        if (line.trim().startsWith("__CODE_BLOCK_")) {
            html += line; 
        } else {
            const text = parseInline(line);
            const dirClass = isFirstCharacterHebrew(text) ? ' class="heb"' : '';
            html += `<p${dirClass}>${text}</p>`;
        }
    });

    closeList();
    closeBlockquote();

    // 4. Restore Code Blocks
    codeBlocks.forEach((block, i) => {
        const placeholder = `__CODE_BLOCK_${i}__`;
        // Escape HTML in code
        const escapedCode = block.code
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
        
        const htmlBlock = `<pre><code class="language-${block.lang}">${escapedCode}</code></pre>`;
        html = html.replace(placeholder, htmlBlock);
    });

    return html;
}

/**
 * Parses inline formatting: Bold, Italic, Links, Images, Code.
 */
function parseInline(text) {
    if (!text) return "";

    // 1. Inline Code `code`
    const codePlaceholders = [];
    text = text.replace(/`([^`]+)`/g, (match, code) => {
        const id = `__INLINE_CODE_${codePlaceholders.length}__`;
        codePlaceholders.push(code.replace(/</g, "&lt;").replace(/>/g, "&gt;"));
        return id;
    });

    // 2. Images ![alt](url)
    text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="md-img awtsmoos-card" />');

    // 3. Links [text](url) - INTELLIGENT ROUTING
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, linkText, url) => {
        // If it starts with #, it's an internal anchor -> No target blank
        if (url.startsWith('#')) {
            return `<a href="${url}" class="internal-link awtsmoos-hero-btn">${linkText}</a>`;
        }
        // Otherwise, open in new tab
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
    });

    // 4. Bold **text**
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // 5. Italic *text*
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // 6. Strikethrough ~~text~~
    text = text.replace(/~~([^~]+)~~/g, '<del>$1</del>');

    // Restore Inline Code
    codePlaceholders.forEach((code, i) => {
        text = text.replace(`__INLINE_CODE_${i}__`, `<code>${code}</code>`);
    });

    return text;
}
