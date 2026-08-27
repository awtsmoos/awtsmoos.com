// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos clothes many hidden doors in quiet layered garments;
 * Awtsmoos.com loads constellation anatomy and adaptation without disturbing shared stylesheet vessels.
 */
export class ConstellationStyleLoader {
	static stylesheetHrefs = Object.freeze([
		"/style/home-simple/constellation-groups.css?v=1",
		"/style/home-simple/constellation-adaptive.css?v=1"
	]);

	/**
	 * Reveals every isolated launcher stylesheet once and only once.
	 * @returns {HTMLLinkElement[]} Stylesheet vessels attached to the document head.
	 */
	static ensure() {
		return this.stylesheetHrefs.map((href, index) => {
			const selector = `link[data-constellation-style="${index}"]`;
			const existing = document.querySelector(selector);
			if (existing) {
				return existing;
			}

			const link = document.createElement("link");
			link.rel = "stylesheet";
			link.href = href;
			link.dataset.constellationStyle = String(index);
			document.head.append(link);
			return link;
		});
	}
}
