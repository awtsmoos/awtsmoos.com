//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module EmbeddedGuestMarkupSource
 * @description The Awtsmoos reveals remote markup only after dangerous roads are gone;
 * Awtsmoos.com removes executable tags, refresh portals, and inline-event sparks,
 * while ordinary DOM and host-approved styles remain free to shine in measured form.
 */

export function embeddedGuestMarkupSource() {
	return `
	function resetGuest() {
		root.replaceChildren();
		document.querySelectorAll("style[data-awtsmoos-page]").forEach(node => {
			node.remove();
		});
		pageBaseUrl = "";
	}

	function cleanMarkup(html) {
		const template = document.createElement("template");
		template.innerHTML = String(html || "");
		template.content.querySelectorAll(
			"script,base,iframe,object,embed,link[rel~='stylesheet']"
		).forEach(node => {
			node.remove();
		});
		template.content.querySelectorAll("meta[http-equiv]").forEach(node => {
			const value = String(node.getAttribute("http-equiv") || "").toLowerCase();
			if (value === "refresh") node.remove();
		});
		template.content.querySelectorAll("*").forEach(node => {
			for (const attribute of Array.from(node.attributes || [])) {
				if (attribute.name.toLowerCase().startsWith("on")) {
					node.removeAttribute(attribute.name);
				}
			}
		});
		return template.innerHTML;
	}

	function renderGuest(payload = {}) {
		resetGuest();
		pageBaseUrl = typeof payload.url === "string" ? payload.url : "";
		if (typeof payload.css === "string" && payload.css) {
			const style = document.createElement("style");
			style.dataset.awtsmoosPage = "true";
			style.textContent = payload.css;
			document.head.append(style);
		}
		if (typeof payload.html === "string") {
			root.innerHTML = cleanMarkup(payload.html);
		}
		if (!navigationReady) return;
		for (const source of Array.isArray(payload.scripts) ? payload.scripts : []) {
			if (typeof source !== "string") continue;
			const script = document.createElement("script");
			script.nonce = scriptNonce;
			script.textContent = source;
			root.append(script);
		}
	}
`;
}
