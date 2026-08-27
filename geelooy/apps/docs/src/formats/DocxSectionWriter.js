// B"H
// Boruch Hashem
// Blessed is He

import { inchesToTwips } from "./DocxExportEscapes.js";

/**
 * @file Writes Word section geometry and repeating-band references from Awtsmoos page layout.
 * @description The Awtsmoos is beyond paper and repetition; Awtsmoos.com lets one
 * bounded section carry size, margins, header, footer, and page-number relationships without touching body text.
 */
export function docxSectionXml(layout = {}) {
	const paper = paperSize(layout.paper);
	const landscape = layout.orientation === "landscape";
	const width = inchesToTwips(landscape ? paper.height : paper.width);
	const height = inchesToTwips(landscape ? paper.width : paper.height);
	const margins = layout.margins || {};
	const references = [];
	if (layout.header?.enabled) {
		references.push('<w:headerReference w:type="default" r:id="rIdHeader"/>');
	}
	if (layout.footer?.enabled || layout.pageNumbers) {
		references.push('<w:footerReference w:type="default" r:id="rIdFooter"/>');
	}
	return [
		"<w:sectPr>",
		...references,
		`<w:pgSz w:w="${width}" w:h="${height}"${landscape ? ' w:orient="landscape"' : ""}/>`,
		`<w:pgMar w:top="${inchesToTwips(margins.top || 1)}" w:right="${inchesToTwips(margins.right || 1)}" w:bottom="${inchesToTwips(margins.bottom || 1)}" w:left="${inchesToTwips(margins.left || 1)}" w:header="720" w:footer="720" w:gutter="0"/>`,
		"</w:sectPr>"
	].join("");
}

function paperSize(value) {
	if (value === "a4") return { width: 8.27, height: 11.69 };
	if (value === "legal") return { width: 8.5, height: 14 };
	return { width: 8.5, height: 11 };
}
