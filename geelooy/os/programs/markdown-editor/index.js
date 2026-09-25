//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MarkdownEditor
 * @description Native Geelooy OS markdown program: WYSIWYG-ish editing over a
 * contenteditable surface (bold/italic/heading/quote/list/link/code buttons,
 * live preview toggle), with the file saved back as markdown.
 *
 * AI ASSIST CONTRACT (window.AwtsmoosDocsAIAssist):
 * A future AI backend overrides this single global BEFORE the program launches.
 *   window.AwtsmoosDocsAIAssist = {
 *     // Rewrite `text` following `instruction`; resolves to the new text.
 *     transform: async (text, instruction) => string,
 *     // Generate fresh text for `instruction`; resolves to text to insert.
 *     insert: async (instruction) => string
 *   };
 * When no override is present, a built-in stub keeps the button honest: it
 * inserts a clearly-marked AI-draft placeholder instead of inventing content.
 */

const DEFAULT_ASSIST = {
	async transform(text) {
		return `${text}\n\n> _AI assist is not connected yet — text left unchanged._`;
	},
	async insert(instruction) {
		return `\n\n> _AI draft for "${instruction}" — connect an AI backend to generate._\n`;
	}
};

function aiAssist() {
	const hook = typeof window !== 'undefined' ? window.AwtsmoosDocsAIAssist : null;
	if (hook && typeof hook.transform === 'function' && typeof hook.insert === 'function') return hook;
	return DEFAULT_ASSIST;
}

export default function createMarkdownEditor({ fileName = 'Untitled.md', content = '', system, path, os } = {}) {
	const id = 'markdownEditor';
	const editor = document.createElement('div');
	editor.className = 'markdown-editor';
	const toolbar = document.createElement('div');
	toolbar.className = 'markdown-editor-toolbar';
	const area = document.createElement('div');
	area.className = 'markdown-editor-area';
	area.contentEditable = 'true';
	area.spellcheck = true;
	area.innerHTML = markdownToHtml(String(content || ''));
	editor.append(toolbar, area);

	const buttons = [
		['B', 'Bold', () => document.execCommand('bold')],
		['I', 'Italic', () => document.execCommand('italic')],
		['H1', 'Heading 1', () => document.execCommand('formatBlock', false, 'h1')],
		['H2', 'Heading 2', () => document.execCommand('formatBlock', false, 'h2')],
		['H3', 'Heading 3', () => document.execCommand('formatBlock', false, 'h3')],
		['❝', 'Quote', () => document.execCommand('formatBlock', false, 'blockquote')],
		['•', 'Bulleted list', () => document.execCommand('insertUnorderedList')],
		['1.', 'Numbered list', () => document.execCommand('insertOrderedList')],
		['🔗', 'Link', insertLink],
		['</>', 'Code', () => document.execCommand('formatBlock', false, 'pre')],
		['👁', 'Preview', togglePreview],
		['✨ AI', 'AI assist', assist]
	];
	for (const [label, title, onClick] of buttons) {
		const button = document.createElement('button');
		button.type = 'button';
		button.className = 'markdown-editor-button';
		button.textContent = label;
		button.title = title;
		button.addEventListener('click', event => { event.preventDefault(); onClick(); area.focus(); });
		toolbar.append(button);
	}

	let previewing = false;
	function togglePreview() {
		previewing = !previewing;
		area.contentEditable = String(!previewing);
		toolbar.querySelectorAll('.markdown-editor-button').forEach(button => {
			if (button.textContent !== '👁') button.disabled = previewing;
		});
	}

	function insertLink() {
		const url = window.prompt('Link URL:', 'https://');
		if (!url) return;
		document.execCommand('createLink', false, url);
	}

	async function assist() {
		const instruction = window.prompt('AI assist — what should I do with the selected text (or the whole document)?');
		if (!instruction) return;
		const selection = window.getSelection();
		const selected = selection && !selection.isCollapsed ? selection.toString() : '';
		const source = selected || htmlToMarkdown(area);
		area.setAttribute('aria-busy', 'true');
		try {
			const result = selected
				? await aiAssist().transform(source, instruction)
				: await aiAssist().insert(instruction);
			if (selected) {
				document.execCommand('insertText', false, result);
			} else {
				area.innerHTML += markdownToHtml(result);
			}
		} finally {
			area.removeAttribute('aria-busy');
		}
		os?.recordGraphEvent?.('file.ai_assist', { path, fileName });
	}

	const self = {
		id,
		div: editor,
		content: () => htmlToMarkdown(area),
		fileName: () => fileName,
		init() {},
		onresize() {}
	};
	if (typeof window !== 'undefined') {
		window.customSaveFunction = () => system?.save?.(self);
	}
	editor.addEventListener('keydown', event => {
		if ((event.ctrlKey || event.metaKey) && event.code === 'KeyS') {
			event.preventDefault();
			system?.save?.(self);
		}
	});
	ensureStyles();
	return self;
}

/** Minimal markdown → HTML renderer (headings, bold, italic, code, links, lists, quotes). */
export function markdownToHtml(markdown) {
	const lines = String(markdown).split('\n');
	const html = [];
	let list = null;
	const closeList = () => { if (list) { html.push(`</${list}>`); list = null; } };
	for (const line of lines) {
		let match;
		if ((match = line.match(/^(#{1,6})\s+(.*)$/))) {
			closeList();
			html.push(`<h${match[1].length}>${inline(match[2])}</h${match[1].length}>`);
		} else if ((match = line.match(/^>\s?(.*)$/))) {
			closeList();
			html.push(`<blockquote>${inline(match[1])}</blockquote>`);
		} else if ((match = line.match(/^(\s*)[-*]\s+(.*)$/))) {
			if (list !== 'ul') { closeList(); html.push('<ul>'); list = 'ul'; }
			html.push(`<li>${inline(match[2])}</li>`);
		} else if ((match = line.match(/^(\s*)\d+[.)]\s+(.*)$/))) {
			if (list !== 'ol') { closeList(); html.push('<ol>'); list = 'ol'; }
			html.push(`<li>${inline(match[2])}</li>`);
		} else if (/^\s*$/.test(line)) {
			closeList();
		} else {
			closeList();
			html.push(`<p>${inline(line)}</p>`);
		}
	}
	closeList();
	return html.join('\n');
}

function inline(text) {
	return escapeHtml(text)
		.replace(/`([^`]+)`/g, '<code>$1</code>')
		.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
		.replace(/(^|\W)\*([^*\n]+)\*/g, '$1<em>$2</em>')
		.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

function escapeHtml(text) {
	return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Serializes the editable surface back to markdown. */
export function htmlToMarkdown(root) {
	const host = root.cloneNode ? root : null;
	const source = host ? host.cloneNode(true) : null;
	if (!source) return String(root || '');
	const parts = [];
	for (const child of [...source.childNodes]) {
		parts.push(blockToMarkdown(child));
	}
	return parts.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

function blockToMarkdown(node) {
	if (node.nodeType === 3) return node.textContent;
	if (node.nodeType !== 1) return '';
	const tag = node.tagName.toLowerCase();
	const text = inlineToMarkdown(node);
	if (/^h[1-6]$/.test(tag)) return `${'#'.repeat(Number(tag[1]))} ${text}`;
	if (tag === 'blockquote') return `> ${text}`;
	if (tag === 'pre') return `\`\`\`\n${node.textContent}\n\`\`\``;
	if (tag === 'li') return `- ${text}`;
	if (tag === 'ul' || tag === 'ol') {
		return [...node.children].map((li, index) =>
			tag === 'ol' ? `${index + 1}. ${inlineToMarkdown(li)}` : `- ${inlineToMarkdown(li)}`).join('\n');
	}
	if (tag === 'hr') return '---';
	if (tag === 'br') return '\n';
	return text;
}

function inlineToMarkdown(node) {
	let out = '';
	for (const child of [...node.childNodes]) {
		if (child.nodeType === 3) {
			out += child.textContent;
			continue;
		}
		if (child.nodeType !== 1) continue;
		const tag = child.tagName.toLowerCase();
		const inner = inlineToMarkdown(child);
		if (tag === 'strong' || tag === 'b') out += `**${inner}**`;
		else if (tag === 'em' || tag === 'i') out += `*${inner}*`;
		else if (tag === 'code') out += `\`${inner}\``;
		else if (tag === 'a') out += `[${inner}](${child.getAttribute('href') || ''})`;
		else if (tag === 'br') out += '\n';
		else out += inner;
	}
	return out;
}

function ensureStyles() {
	if (document.querySelector('style[data-markdown-editor]')) return;
	const style = document.createElement('style');
	style.setAttribute('data-markdown-editor', 'true');
	style.textContent = `
.markdown-editor { display: flex; flex-direction: column; height: 100%; background: #fff; color: #111; }
.markdown-editor-toolbar { display: flex; flex-wrap: wrap; gap: 4px; padding: 8px; border-bottom: 1px solid #e2e2e2; background: #fafafa; }
.markdown-editor-button { border: 1px solid #ddd; background: #fff; border-radius: 6px; padding: 4px 10px; cursor: pointer; font-size: 13px; }
.markdown-editor-button:hover:not(:disabled) { background: #f0f0f0; }
.markdown-editor-button:disabled { opacity: 0.4; cursor: default; }
.markdown-editor-area { flex: 1; overflow: auto; padding: 16px 20px; outline: none; line-height: 1.65; }
.markdown-editor-area h1, .markdown-editor-area h2, .markdown-editor-area h3 { margin: 0.8em 0 0.4em; }
.markdown-editor-area blockquote { border-left: 3px solid #ccc; margin: 0.6em 0; padding-left: 12px; color: #555; }
.markdown-editor-area pre { background: #f4f4f4; padding: 10px; border-radius: 6px; overflow: auto; }
.markdown-editor-area code { background: #f4f4f4; padding: 1px 5px; border-radius: 4px; }
`;
	document.head.append(style);
}
