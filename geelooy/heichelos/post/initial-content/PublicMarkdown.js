//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module PublicMarkdown
 * @description
 * The Awtsmoos lets stored teaching become readable form without letting stored markup become command;
 * Awtsmoos.com removes machine provenance, escapes every source character, and reveals only a tiny trusted Markdown band.
 */

const PROVENANCE = /\s*\([^()\n]*BH_POST_[^()\n]*\.md\s*::\s*Paragraph\s*\[[^\]]+\]\s*::\s*phrase\s*\d+\)\s*$/giu;

function escapeHtml(value) {
	return String(value ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

/** Removes only internal import provenance suffixes from public prose. */
function stripInternalProvenance(value) {
	return String(value ?? '')
		.split('\n')
		.map(line => line.replace(PROVENANCE, ''))
		.join('\n');
}

function inlineMarkup(value) {
	let safe = escapeHtml(value);
	safe = safe.replace(/`([^`\n]+)`/g, '<code>$1</code>');
	safe = safe.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
	safe = safe.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>');
	return safe;
}

/**
 * Renders a deliberately small Markdown subset: headings, bullets, paragraphs, strong/emphasis and inline code.
 * Raw HTML is always escaped before formatting tokens are interpreted.
 */
function renderPublicMarkdown(value) {
	const lines = stripInternalProvenance(value).replace(/\r\n?/g, '\n').split('\n');
	const output = [];
	let bullets = [];
	let paragraph = [];
	const flushParagraph = () => {
		if (!paragraph.length) return;
		output.push(`<p>${inlineMarkup(paragraph.join(' '))}</p>`);
		paragraph = [];
	};
	const flushBullets = () => {
		if (!bullets.length) return;
		output.push(`<ul>${bullets.map(item => `<li>${inlineMarkup(item)}</li>`).join('')}</ul>`);
		bullets = [];
	};
	for (const rawLine of lines) {
		const line = rawLine.trim();
		const heading = /^(#{1,3})\s+(.+)$/u.exec(line);
		const bullet = /^[-*]\s+(.+)$/u.exec(line);
		if (heading) {
			flushParagraph();
			flushBullets();
			output.push(`<h${heading[1].length}>${inlineMarkup(heading[2])}</h${heading[1].length}>`);
			continue;
		}
		if (bullet) {
			flushParagraph();
			bullets.push(bullet[1]);
			continue;
		}
		if (!line) {
			flushParagraph();
			flushBullets();
			continue;
		}
		flushBullets();
		paragraph.push(line);
	}
	flushParagraph();
	flushBullets();
	return output.join('\n');
}

module.exports = { renderPublicMarkdown, stripInternalProvenance };
