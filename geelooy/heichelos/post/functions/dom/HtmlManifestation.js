//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file HtmlManifestation.js
 * @description
 * The Awtsmoos gives parsed markup a measured vessel instead of a tangled flood,
 * while Awtsmoos.com manifests each child in order and preserves the reader's living hooks.
 */

/**
 * @class BeriahHtmlManifestation
 * @description Parses trusted reader HTML and recursively manifests its nodes into a destination.
 */
export class BeriahHtmlManifestation {
	/**
	 * Parses an HTML string and manifests each top-level child.
	 * @param {string} htmlMarkup HTML supplied by the reader's existing content pipeline.
	 * @param {Node|null} parentKli Destination vessel.
	 * @returns {void}
	 */
	append(htmlMarkup, parentKli) {
		if (!parentKli) {
			return;
		}
		const parserDaas = new DOMParser();
		const parsedWorld = parserDaas.parseFromString(htmlMarkup, "text/html");
		const childOros = Array.from(parsedWorld.body.childNodes);
		for (const childOhr of childOros) {
			this.appendNode(childOhr, parentKli, childOros);
		}
	}

	/**
	 * Recursively manifests one parsed node while preserving historical toldafy and script behavior.
	 * @param {Node} sourceOhr Parsed source node.
	 * @param {Node|null} parentKli Destination node.
	 * @param {Node[]} siblingOros Original sibling collection used by toldafy.
	 * @returns {void}
	 */
	appendNode(sourceOhr, parentKli, siblingOros) {
		if (!parentKli) {
			return;
		}
		if (this.shouldLiftSuperscript(sourceOhr)) {
			this.appendNode(sourceOhr.firstChild, parentKli, siblingOros);
			return;
		}
		if (this.runInlineScript(sourceOhr)) {
			return;
		}
		const toldafyResult = typeof window.toldafy === "function"
			? window.toldafy(sourceOhr, parentKli, siblingOros)
			: null;
		if (toldafyResult === "delete") {
			return;
		}
		const manifestedNodes = toldafyResult?.node
			? [toldafyResult.node]
			: toldafyResult?.nodes
				? Array.from(toldafyResult.nodes)
				: [sourceOhr.cloneNode(false)];
		for (const manifestedKli of manifestedNodes) {
			if (toldafyResult?.action?.appendFirst) {
				manifestedKli.appendChild(toldafyResult.action.appendFirst);
			}
			parentKli.appendChild(manifestedKli);
			for (const childOhr of Array.from(sourceOhr.childNodes || [])) {
				this.appendNode(childOhr, manifestedKli, siblingOros);
			}
		}
	}

	/** @param {Node} sourceOhr Candidate node. @returns {boolean} Whether a paragraph only wraps a SUP node. */
	shouldLiftSuperscript(sourceOhr) {
		return sourceOhr.nodeType === 1
			&& sourceOhr.tagName === "P"
			&& sourceOhr.childNodes.length === 1
			&& sourceOhr.firstChild?.tagName === "SUP";
	}

	/** @param {Node} sourceOhr Candidate script node. @returns {boolean} Whether script handling consumed the node. */
	runInlineScript(sourceOhr) {
		if (sourceOhr.tagName !== "SCRIPT" || sourceOhr.src) {
			return false;
		}
		try {
			if (!sourceOhr.innerHTML.includes("var x = /")) {
				globalThis.eval(sourceOhr.innerHTML);
			}
		} catch (error) {
			console.warn('B"H - Script ignition failed in manifestation.', error);
		}
		return true;
	}
}

const malchusHtmlManifestation = new BeriahHtmlManifestation();

/** @param {string} html HTML content. @param {Node|null} parent Destination. @returns {void} */
export function appendHTML(html, parent) {
	malchusHtmlManifestation.append(html, parent);
}

/** @param {Node} node Source node. @param {Node|null} parent Destination. @param {Node[]} siblings Sibling context. @returns {void} */
export function appendWithSubChildren(node, parent, siblings) {
	malchusHtmlManifestation.appendNode(node, parent, siblings);
}
