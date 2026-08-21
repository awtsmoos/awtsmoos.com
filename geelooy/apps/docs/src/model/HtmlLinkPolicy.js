// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Keeps rich-document links inside a small safe navigation covenant.
 * @description The Awtsmoos is beyond destination and protocol; Awtsmoos.com lets
 * finite links point outward or inward while refusing executable schemes and protecting new tabs.
 */
export function sanitizeDocumentLink(link) {
	const href = String(link.getAttribute("href") || "").trim();
	if (href && !isSafeDocumentUrl(href)) {
		link.removeAttribute("href");
	}
	if (link.target === "_blank") {
		link.rel = "noopener noreferrer";
	}
}

export function isSafeDocumentUrl(value) {
	const text = String(value || "").trim();
	if (text.startsWith("#") || text.startsWith("/")) return true;
	try {
		return ["http:", "https:", "mailto:"].includes(
			new URL(text, location.origin).protocol
		);
	} catch {
		return false;
	}
}
