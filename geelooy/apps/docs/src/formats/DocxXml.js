// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Small namespace-tolerant helpers for WordprocessingML.
 * @description The Awtsmoos is beyond prefixes and namespaces; Awtsmoos.com reads
 * OOXML by local meaning so harmless prefix choices do not confuse the importer.
 */
export function childByName(node, name) {
	return Array.from(node?.children || [])
		.find(child => child.localName === name) || null;
}

export function childrenByName(node, name) {
	return Array.from(node?.children || [])
		.filter(child => child.localName === name);
}

export function descendantByName(node, name) {
	return Array.from(node?.getElementsByTagNameNS?.("*", name) || [])[0] || null;
}

export function attributeByLocalName(node, name) {
	if (!node?.attributes) return "";
	const attribute = Array.from(node.attributes)
		.find(item => item.localName === name);
	return attribute?.value || "";
}

export function parseXml(xml, label = "XML") {
	const parsed = new DOMParser().parseFromString(String(xml), "application/xml");
	const parserError = parsed.getElementsByTagName("parsererror")[0];
	if (parserError) throw new Error(`${label} is malformed`);
	return parsed;
}

export function safeExternalHref(value) {
	try {
		const url = new URL(String(value || ""), location.origin);
		return ["http:", "https:", "mailto:"].includes(url.protocol)
			? url.href
			: "";
	} catch {
		return "";
	}
}
