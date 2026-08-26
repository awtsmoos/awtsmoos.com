//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module EmbeddedGuestMarkupSource
 * @description
 * The Awtsmoos lets remote structure become the guest document without surrendering the
 * host's covenant. Awtsmoos.com removes executable roads first, then gives safe head and
 * body nodes their native browser places; the page may see a truthful document.body,
 * while CSP, channel guards, and network law remain above every changing garment.
 */

/**
 * Generates guest-side markup sanitation and document hydration helpers.
 *
 * @returns {string} Readable JavaScript executed inside the opaque guest frame.
 */
export function embeddedGuestMarkupSource() {
	return `
	function clearPageHead() {
		document.head.querySelectorAll("[data-awtsmoos-page-head]").forEach(node => {
			node.remove();
		});
	}

	function resetGuest() {
		clearPageHead();
		document.body.replaceChildren();
		pageBaseUrl = "";
	}

	function cleanMarkup(html) {
		const template = document.createElement("template");
		template.innerHTML = String(html || "");
		template.content.querySelectorAll(
			"script,base,iframe,object,embed,link"
		).forEach(node => {
			node.remove();
		});
		template.content.querySelectorAll("meta[http-equiv],meta[name='referrer']").forEach(node => {
			node.remove();
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

	function copyRemoteHead(parsedDocument) {
		clearPageHead();
		for (const child of Array.from(parsedDocument.head.children)) {
			const clone = document.importNode(child, true);
			clone.dataset.awtsmoosPageHead = "true";
			document.head.append(clone);
		}
	}

	function copyRemoteBody(parsedDocument) {
		const nodes = Array.from(parsedDocument.body.childNodes).map(node => {
			return document.importNode(node, true);
		});
		document.body.replaceChildren(...nodes);
	}

	function hydrateGuestDocument(html) {
		const parser = new DOMParser();
		const parsedDocument = parser.parseFromString(cleanMarkup(html), "text/html");
		copyRemoteHead(parsedDocument);
		copyRemoteBody(parsedDocument);
	}

	function appendCollectedStyles(css) {
		if (typeof css !== "string" || !css) return;
		const style = document.createElement("style");
		style.dataset.awtsmoosPageHead = "true";
		style.textContent = css;
		document.head.append(style);
	}

	function renderGuest(payload = {}) {
		resetGuest();
		pageBaseUrl = typeof payload.url === "string" ? payload.url : "";
		if (typeof payload.html === "string") {
			hydrateGuestDocument(payload.html);
		}
		appendCollectedStyles(payload.css);
		if (!navigationReady) return;
		for (const source of Array.isArray(payload.scripts) ? payload.scripts : []) {
			if (typeof source !== "string") continue;
			const script = document.createElement("script");
			script.nonce = scriptNonce;
			script.textContent = source;
			document.body.append(script);
		}
	}
`;
}
