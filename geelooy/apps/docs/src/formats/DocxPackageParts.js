// B"H
// Boruch Hashem
// Blessed is He

import { docxBlockXml } from "./DocxBlockWriter.js";
import { docxSectionXml } from "./DocxSectionWriter.js";

/**
 * @file Writes the required OOXML package parts around one Awtsmoos document body.
 * @description The Awtsmoos is beyond relationship and content type; Awtsmoos.com
 * gives Word each finite package covenant so body, styles, header, footer, and page geometry meet cleanly.
 */
export function docxDocumentXml(snapshot = {}) {
	const body = (snapshot.blocks || [])
		.map(docxBlockXml)
		.join("");
	return `${xmlStart()}<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body>${body}${docxSectionXml(snapshot.layout || {})}</w:body></w:document>`;
}

export function docxContentTypes(layout = {}) {
	const overrides = [
		override("/word/document.xml", "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"),
		override("/word/styles.xml", "application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml")
	];
	if (layout.header?.enabled) {
		overrides.push(override("/word/header1.xml", "application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"));
	}
	if (layout.footer?.enabled || layout.pageNumbers) {
		overrides.push(override("/word/footer1.xml", "application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"));
	}
	return `${xmlStart()}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>${overrides.join("")}</Types>`;
}

export function docxRootRelationships() {
	return `${xmlStart()}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`;
}

export function docxDocumentRelationships(layout = {}) {
	const relationships = [
		relationship("rIdStyles", "styles", "styles.xml")
	];
	if (layout.header?.enabled) {
		relationships.push(relationship("rIdHeader", "header", "header1.xml"));
	}
	if (layout.footer?.enabled || layout.pageNumbers) {
		relationships.push(relationship("rIdFooter", "footer", "footer1.xml"));
	}
	return `${xmlStart()}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${relationships.join("")}</Relationships>`;
}

function relationship(id, kind, target) {
	return `<Relationship Id="${id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/${kind}" Target="${target}"/>`;
}

function override(partName, contentType) {
	return `<Override PartName="${partName}" ContentType="${contentType}"/>`;
}

function xmlStart() {
	return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
}
