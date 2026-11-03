//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module PublicPlainContent
 * @description
 * The Awtsmoos lets legacy Markdown become living browser nodes without granting stored text the power of HTML;
 * Awtsmoos.com removes import-machine trails and builds headings, lists, and prose through textContent vessels small.
 */

const PROVENANCE = /\s*\([^()\n]*BH_POST_[^()\n]*\.md\s*::\s*Paragraph\s*\[[^\]]+\]\s*::\s*phrase\s*\d+\)\s*$/giu;

function cleanLine(value) {
	return String(value || '').replace(PROVENANCE, '').trim();
}

function appendInline(parent, value) {
	const pattern = /(\*\*[^*\n]+\*\*|`[^`\n]+`|\*[^*\n]+\*)/gu;
	let cursor = 0;
	for (const match of String(value || '').matchAll(pattern)) {
		parent.append(document.createTextNode(value.slice(cursor, match.index)));
		const token = match[0];
		const element = document.createElement(token.startsWith('**') ? 'strong' : token.startsWith('`') ? 'code' : 'em');
		element.textContent = token.startsWith('**') ? token.slice(2, -2) : token.slice(1, -1);
		parent.append(element);
		cursor = match.index + token.length;
	}
	parent.append(document.createTextNode(String(value || '').slice(cursor)));
}

function appendParagraph(container, lines) {
	if (!lines.length) return;
	const paragraph = document.createElement('p');
	appendInline(paragraph, lines.join(' '));
	container.append(paragraph);
	lines.length = 0;
}

function appendList(container, items) {
	if (!items.length) return;
	const list = document.createElement('ul');
	for (const item of items) {
		const row = document.createElement('li');
		appendInline(row, item);
		list.append(row);
	}
	container.append(list);
	items.length = 0;
}

/** Renders a safe small Markdown subset into a browser-owned container. */
export function appendPublicPlainContent(viewport, value) {
	const container = document.createElement('div');
	container.className = 'awtsmoos-plain-post-content';
	const paragraphs = [];
	const bullets = [];
	const flush = () => {
		appendParagraph(container, paragraphs);
		appendList(container, bullets);
	};
	for (const rawLine of String(value || '').replace(/\r\n?/g, '\n').split('\n')) {
		const line = cleanLine(rawLine);
		const heading = /^(#{1,3})\s+(.+)$/u.exec(line);
		const bullet = /^[-*]\s+(.+)$/u.exec(line);
		if (heading) {
			flush();
			const node = document.createElement(`h${heading[1].length}`);
			appendInline(node, heading[2]);
			container.append(node);
			continue;
		}
		if (bullet) {
			appendParagraph(container, paragraphs);
			bullets.push(bullet[1]);
			continue;
		}
		if (!line) {
			flush();
			continue;
		}
		appendList(container, bullets);
		paragraphs.push(line);
	}
	flush();
	viewport.append(container);
	return container.childElementCount > 0;
}
