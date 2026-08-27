// B"H
// Boruch Hashem
// Blessed is He

import {
	normalizeDocumentLayout,
	physicalPageSize
} from "./DocumentLayoutPolicy.js";

/**
 * @file Projects persistent document layout into screen CSS and true print page rules.
 * @description The Awtsmoos is beyond width and edge; Awtsmoos.com lets one living
 * document wear screen-paper, pageless flow, and printer garments without changing its body.
 */
export class PageLayoutView {
	constructor(app, canvas) {
		this.app = app;
		this.canvas = canvas;
		this.printStyle = ensurePrintStyle();
	}

	render(candidate = {}) {
		const layout = normalizeDocumentLayout(candidate);
		const size = physicalPageSize(layout);
		this.app.dataset.pageMode = layout.mode;
		this.app.dataset.paper = layout.paper;
		this.app.dataset.orientation = layout.orientation;
		this.app.dataset.pagelessWidth = layout.pagelessWidth;
		this.#setInches("--docs-paper-width", size.width);
		this.#setInches("--docs-paper-height", size.height);
		this.#setInches("--docs-margin-top", layout.margins.top);
		this.#setInches("--docs-margin-right", layout.margins.right);
		this.#setInches("--docs-margin-bottom", layout.margins.bottom);
		this.#setInches("--docs-margin-left", layout.margins.left);
		this.#setBands(layout);
		this.#setPrintRule(layout, size);
		return layout;
	}

	#setBands(layout) {
		this.canvas.dataset.headerEnabled = String(layout.header.enabled);
		this.canvas.dataset.headerText = layout.header.text;
		this.canvas.dataset.footerEnabled = String(layout.footer.enabled);
		this.canvas.dataset.footerText = layout.footer.text;
		this.canvas.dataset.pageNumbers = String(layout.pageNumbers);
	}

	#setPrintRule(layout, size) {
		const margins = layout.margins;
		const header = layout.header.enabled ? marginBox("top-center", layout.header.text) : "";
		const footerText = layout.footer.enabled ? `${cssText(layout.footer.text)} ` : "";
		const pageNumber = layout.pageNumbers ? "counter(page)" : "''";
		const footer = footerText || layout.pageNumbers
			? `@bottom-center { content: ${footerText}${pageNumber}; }`
			: "";
		this.printStyle.textContent = `@page { size: ${size.width}in ${size.height}in; margin: ${margins.top}in ${margins.right}in ${margins.bottom}in ${margins.left}in; ${header} ${footer} }`;
	}

	#setInches(name, value) {
		this.app.style.setProperty(name, `${value}in`);
	}
}

function ensurePrintStyle() {
	let style = document.querySelector("#docsDynamicPrintStyle");
	if (style) return style;
	style = document.createElement("style");
	style.id = "docsDynamicPrintStyle";
	document.head.append(style);
	return style;
}

function marginBox(position, text) {
	return `@${position} { content: ${cssText(text)}; }`;
}

function cssText(value) {
	const escaped = String(value || "")
		.replace(/\\/g, "\\\\")
		.replace(/'/g, "\\'")
		.replace(/[\r\n]+/g, " ");
	return `'${escaped}'`;
}
