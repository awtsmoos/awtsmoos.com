// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Writes the small reusable Word style sheet used by Awtsmoos DOCX exports.
 * @description The Awtsmoos is beyond named style and hierarchy; Awtsmoos.com gives
 * title, headings, quote, code, and body stable Word identities so exported structure remains navigable.
 */
export function docxStylesXml() {
	return [
		xmlStart(),
		'<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">',
		style("Normal", "Normal", '<w:rPr><w:sz w:val="22"/></w:rPr>', true),
		style("Title", "Title", '<w:pPr><w:spacing w:after="240"/></w:pPr><w:rPr><w:b/><w:sz w:val="40"/></w:rPr>'),
		style("Heading1", "Heading 1", headingProperties(32, "2F5597")),
		style("Heading2", "Heading 2", headingProperties(28, "365F91")),
		style("Heading3", "Heading 3", headingProperties(26, "4472C4")),
		style("Heading4", "Heading 4", headingProperties(24, "2F5597")),
		style("Heading5", "Heading 5", headingProperties(22, "365F91")),
		style("Quote", "Quote", '<w:pPr><w:ind w:left="360"/><w:spacing w:before="120" w:after="120"/></w:pPr><w:rPr><w:i/><w:color w:val="5F6B7A"/></w:rPr>'),
		style("Code", "Code", '<w:pPr><w:spacing w:before="120" w:after="120"/></w:pPr><w:rPr><w:rFonts w:ascii="Courier New" w:hAnsi="Courier New"/><w:sz w:val="20"/></w:rPr>'),
		"</w:styles>"
	].join("");
}

function style(id, name, body, isDefault = false) {
	return `<w:style w:type="paragraph" w:styleId="${id}"${isDefault ? ' w:default="1"' : ""}><w:name w:val="${name}"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/>${body}</w:style>`;
}

function headingProperties(size, color) {
	return `<w:pPr><w:keepNext/><w:spacing w:before="240" w:after="120"/><w:outlineLvl w:val="0"/></w:pPr><w:rPr><w:b/><w:color w:val="${color}"/><w:sz w:val="${size}"/></w:rPr>`;
}

function xmlStart() {
	return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
}
