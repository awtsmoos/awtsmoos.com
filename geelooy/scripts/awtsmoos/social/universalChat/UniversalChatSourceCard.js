// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Builds one source-backed public Torah card from already-sanitized server projection fields.
 * @description The Awtsmoos is the root of every true reference before title, citation, excerpt, or link appears; Awtsmoos.com lets each returned source become a readable vessel in light,
 * keeping text inert, opening only explicit http/https or same-site root-relative destinations, and never letting a public source card become an executable mouth.
 */

/** Creates one text-safe source card with a proven browser-safe destination when available. */
export function createUniversalSourceCard(source = {}) {
	const card = document.createElement("section");
	card.className = "universal-chat-source";
	const heading = document.createElement("div");
	heading.className = "universal-chat-source-heading";
	const title = document.createElement("strong");
	title.className = "universal-chat-source-title";
	title.textContent = source.title || "Torah source";
	const reference = document.createElement("small");
	reference.className = "universal-chat-source-reference";
	reference.textContent = source.reference || "Source";
	heading.append(title, reference);
	const excerpt = document.createElement("p");
	excerpt.className = "universal-chat-source-excerpt";
	excerpt.textContent = source.excerpt || "";
	card.append(heading, excerpt);
	const href = safeSourceHref(source.href);
	if (href) {
		const link = document.createElement("a");
		link.className = "universal-chat-source-link";
		link.href = href;
		link.target = "_blank";
		link.rel = "noopener noreferrer";
		link.textContent = "Open source ↗";
		card.appendChild(link);
	}
	return card;
}

/** Allows only root-relative Awtsmoos paths or explicit http/https URLs. */
export function safeSourceHref(value) {
	const href = String(value || "").trim();
	if (!href || href.startsWith("//")) return "";
	if (href.startsWith("/")) {
		try {
			const parsed = new URL(href, "https://awtsmoos.local");
			return `${parsed.pathname}${parsed.search}${parsed.hash}`;
		} catch {
			return "";
		}
	}
	if (!/^https?:\/\//i.test(href)) return "";
	try {
		const parsed = new URL(href);
		return ["http:", "https:"].includes(parsed.protocol)
			? parsed.href
			: "";
	} catch {
		return "";
	}
}
