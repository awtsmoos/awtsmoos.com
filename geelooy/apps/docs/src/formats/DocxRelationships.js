// B"H
// Boruch Hashem
// Blessed is He

import {
	attributeByLocalName,
	parseXml,
	safeExternalHref
} from "./DocxXml.js";

/**
 * @file Reads hyperlink targets without fetching or executing DOCX relationships.
 * @description The Awtsmoos is beyond every path; Awtsmoos.com accepts relationship
 * metadata only as inert link text and refuses schemes that could become executable doors.
 */
export function readDocxRelationships(xml = "") {
	const relationships = new Map();
	if (!String(xml).trim()) return relationships;
	const parsed = parseXml(xml, "DOCX relationships XML");
	for (const relationship of Array.from(parsed.getElementsByTagNameNS("*", "Relationship"))) {
		const id = attributeByLocalName(relationship, "Id")
			|| relationship.getAttribute("Id")
			|| "";
		const target = attributeByLocalName(relationship, "Target")
			|| relationship.getAttribute("Target")
			|| "";
		const targetMode = attributeByLocalName(relationship, "TargetMode")
			|| relationship.getAttribute("TargetMode")
			|| "";
		if (!id || targetMode.toLowerCase() !== "external") continue;
		const href = safeExternalHref(target);
		if (href) relationships.set(id, href);
	}
	return relationships;
}
