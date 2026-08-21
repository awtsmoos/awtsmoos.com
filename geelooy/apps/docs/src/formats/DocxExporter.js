// B"H
// Boruch Hashem
// Blessed is He

import { headerXml, footerXml } from "./DocxHeaderFooterWriter.js";
import {
	docxContentTypes,
	docxDocumentRelationships,
	docxDocumentXml,
	docxRootRelationships
} from "./DocxPackageParts.js";
import { docxStylesXml } from "./DocxStylesWriter.js";
import { ZipArchiveWriter } from "./ZipArchiveWriter.js";

/**
 * @file Assembles a real dependency-free OOXML DOCX package from one Awtsmoos snapshot.
 * @description The Awtsmoos is beyond Word and archive; Awtsmoos.com gathers body,
 * styles, relationships, page bands, and package law into one transparent finite vessel.
 */
export class DocxExporter {
	static create(snapshot = {}) {
		const layout = snapshot.layout || {};
		const writer = new ZipArchiveWriter();
		writer
			.addText("[Content_Types].xml", docxContentTypes(layout))
			.addText("_rels/.rels", docxRootRelationships())
			.addText("word/document.xml", docxDocumentXml(snapshot))
			.addText("word/styles.xml", docxStylesXml())
			.addText(
				"word/_rels/document.xml.rels",
				docxDocumentRelationships(layout)
			);
		if (layout.header?.enabled) {
			writer.addText(
				"word/header1.xml",
				headerXml(layout.header.text)
			);
		}
		if (layout.footer?.enabled || layout.pageNumbers) {
			writer.addText(
				"word/footer1.xml",
				footerXml(layout.footer?.text || "", layout.pageNumbers === true)
			);
		}
		return new Blob(
			[writer.toUint8Array()],
			{
				type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
			}
		);
	}
}
