
// B"H
/**
 * UI Markdown Module
 * Handles Modal logic and robust Markdown parsing
 */

let infoModal = null;
let infoContent = null;
let cachedReadme = null;

export function initMarkdown(modalId, contentId) {
    infoModal = document.getElementById(modalId);
    infoContent = document.getElementById(contentId);
}

export async function openInfoModal() {
    if (!infoModal || !infoContent) return;
    
    infoModal.classList.remove('hidden');
    
    if (!cachedReadme) {
        try {
            const res = await fetch('./README.md');
            if (!res.ok) throw new Error("Failed to load README.md");
            const text = await res.text();
            cachedReadme = parseMarkdown(text);
            infoContent.innerHTML = cachedReadme;
        } catch (e) {
            infoContent.innerHTML = `<div class="text-red-500 font-bold p-4">Error loading manual: ${e.message}</div>`;
        }
    } else {
        infoContent.innerHTML = cachedReadme;
    }
}

export function closeInfoModal() {
    if (infoModal) {
        infoModal.classList.add('hidden');
    }
}

/**
 * Robust Markdown Parser
 * Handles Headers, Lists, Code Blocks, Blockquotes, Bold, Italic
 */
export function parseMarkdown(md) {
    if (!md) return '';
    // Normalize line endings and handle multiple newlines correctly
    const lines = md.replace(/\r\n/g, '\n').split('\n');
    let html = '';
    let inCodeBlock = false;
    let codeLang = '';

    const processInline = (text) => {
        // B"H - Escape HTML first to prevent injection inside code blocks etc.
        text = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        // Code
        text = text.replace(/`([^`]+)`/g, '<code class="bg-gray-800 text-pink-300 px-1 rounded font-mono text-sm border border-gray-700">$1</code>');
        // Bold
        text = text.replace(/\*\*([^*]+)\*\*/g, '<strong class="text-emerald-300 font-bold">$1</strong>');
        // Italic
        text = text.replace(/\*([^*]+)\*/g, '<em class="text-blue-300 italic">$1</em>');
        // Links
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-blue-400 underline hover:text-blue-300">$1</a>');
        return text;
    };
    
    let listType = null;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        // Code Blocks
        if (line.startsWith('```')) {
            if (inCodeBlock) {
                html += '</code></pre>';
                inCodeBlock = false;
            } else {
                codeLang = line.substring(3).trim();
                html += `<pre class="bg-gray-900 border border-gray-700 rounded p-4 my-4 overflow-x-auto text-gray-300 font-mono text-sm"><code class="language-${codeLang}">`;
                inCodeBlock = true;
            }
            continue;
        }
        if (inCodeBlock) {
            html += line.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '\n';
            continue;
        }
        
        // Close list if line is not a list item
        const isUItem = line.match(/^\s*[-*]\s+(.*)/);
        const isOItem = line.match(/^\s*\d+\.\s+(.*)/);
        
        if (!isUItem && !isOItem && listType) {
            html += `</${listType}>`;
            listType = null;
        }

        // Headers
        if (line.startsWith('#')) {
             const level = line.match(/^#+/)[0].length;
             const content = line.substring(level).trim();
             html += `<h${level} class="mt-4 mb-2 font-bold text-lg">${processInline(content)}</h${level}>`;
        }
        // Unordered List
        else if (isUItem) {
            if (listType !== 'ul') {
                if (listType) html += `</${listType}>`;
                html += '<ul class="list-disc list-outside ml-6 my-2 space-y-1">';
                listType = 'ul';
            }
            html += `<li>${processInline(isUItem[1])}</li>`;
        }
        // Ordered List
        else if (isOItem) {
             if (listType !== 'ol') {
                if (listType) html += `</${listType}>`;
                html += '<ol class="list-decimal list-outside ml-6 my-2 space-y-1">';
                listType = 'ol';
            }
            html += `<li>${processInline(isOItem[1])}</li>`;
        }
        // Blockquote
        else if (line.startsWith('>')) {
            html += `<blockquote class="border-l-4 border-emerald-500 pl-4 py-1 my-2 italic text-gray-400">${processInline(line.substring(1).trim())}</blockquote>`;
        }
        // Paragraph
        else if (line.trim() !== '') {
            html += `<p>${processInline(line)}</p>`;
        }
    }
    
    if (listType) html += `</${listType}>`;
    if (inCodeBlock) html += '</code></pre>';

    // B"H - A simple paragraph wrapper for single-line non-block text
    if (!html.includes('<p>') && !html.includes('<h') && !html.includes('<ul') && !html.includes('<ol') && !html.includes('<block') && !html.includes('<pre>')) {
        if(html.trim()) return `<p>${html}</p>`;
    }

    return html.replace(/<p><\/p>/g, '');
}