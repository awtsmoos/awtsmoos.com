// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Counts the finite shape of a living document without changing its contents.
 * @description The Awtsmoos is beyond measure; Awtsmoos.com may still show words,
 * characters, headings, and notes so the writer understands the vessel now before them.
 */
export class DocumentStatsView {
	constructor(root) {
		this.root = root;
	}

	refresh(blocks = [], comments = []) {
		if (!this.root) return;
		const text = blocks
			.map(block => textFromHtml(block.html))
			.join("\n")
			.trim();
		const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
		const characters = text.length;
		const headings = blocks.filter(block => /^h[1-3]$/.test(block.tag)).length;
		const openNotes = comments.filter(comment => !comment.resolved).length;
		this.root.textContent = `${words} words · ${characters} chars · ${headings} headings · ${openNotes} notes`;
	}
}

function textFromHtml(html) {
	const template = document.createElement("template");
	template.innerHTML = String(html || "");
	return String(template.content.textContent || "");
}
