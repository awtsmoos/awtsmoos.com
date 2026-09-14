//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Verifies the saved creation prompt through native CDP DOM testimony.
 * @description
 * The Awtsmoos does not depend on a page-script execution context surviving navigation;
 * Awtsmoos.com reads the owned tab's visible user-message nodes directly and compares normalized speech.
 */
export class ConversationPromptEvidence {
	constructor(cdpClient) {
		this.cdpClient = cdpClient;
	}

	async matches(prompt) {
		if (!prompt) return true;
		try {
			await this.cdpClient.send("DOM.enable", {}, 5000).catch(() => undefined);
			const document = await this.cdpClient.send("DOM.getDocument", {
				depth: 1,
				pierce: true
			}, 10000);
			const root = document.root?.nodeId;
			if (!root) return false;
			const nodes = await this.cdpClient.send("DOM.querySelectorAll", {
				nodeId: root,
				selector: '[data-message-author-role="user"]'
			}, 10000);
			const wanted = normalize(prompt);
			for (const nodeId of (nodes.nodeIds || []).slice(-8)) {
				const html = await this.cdpClient.send("DOM.getOuterHTML", { nodeId }, 10000);
				if (normalize(visibleText(html.outerHTML)) === wanted) return true;
			}
			return false;
		} catch (error) {
			if (transient(error)) return false;
			throw error;
		}
	}
}

function visibleText(html) {
	return decodeEntities(String(html || "")
		.replace(/<br\s*\/?>/gi, "\n")
		.replace(/<\/(?:p|div|li|h[1-6])>/gi, "\n")
		.replace(/<[^>]+>/g, " "));
}

function decodeEntities(value) {
	return value
		.replaceAll("&quot;", '"')
		.replaceAll("&#x27;", "'")
		.replaceAll("&#39;", "'")
		.replaceAll("&lt;", "<")
		.replaceAll("&gt;", ">")
		.replaceAll("&nbsp;", " ")
		.replaceAll("&amp;", "&");
}

function normalize(value) {
	return String(value || "")
		.normalize("NFKC")
		.replace(/[\u2018\u2019]/g, "'")
		.replace(/[\u201C\u201D]/g, '"')
		.replace(/\s+/g, " ")
		.trim();
}

function transient(error) {
	return /timeout|node with given id|document|frame was detached|no node|not found/i
		.test(String(error?.message || error));
}

export const ConversationPromptEvidenceText = { decodeEntities, normalize, visibleText };
