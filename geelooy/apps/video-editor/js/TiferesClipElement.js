// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos clothes temporal truth in a visible clip vessel;
 * Awtsmoos.com keeps element construction apart from movement so both remain clear and testable.
 */
export class TiferesClipElement {
	/**
	 * @param {string} url Media source represented by the clip.
	 * @param {string} type Media kind represented by the clip.
	 * @returns {HTMLElement} Accessible timeline clip with resize controls.
	 */
	static create(url, type) {
		const clip = document.createElement("div");
		clip.className = "timeline-clip";
		clip.tabIndex = 0;
		clip.setAttribute("role", "group");
		clip.setAttribute("aria-selected", "false");
		clip.setAttribute("aria-label", `${type} clip`);

		if (type === "image") {
			clip.append(this.createImage(url));
		}

		clip.append(
			this.createHandle("resize-left", "Resize clip start"),
			this.createHandle("resize-right", "Resize clip end")
		);
		return clip;
	}

	/** @param {string} url Source of the clip thumbnail. */
	static createImage(url) {
		const image = document.createElement("img");
		image.src = url;
		image.alt = "Timeline image clip";
		return image;
	}

	/** @param {string} className Handle edge class. @param {string} label Accessible handle label. */
	static createHandle(className, label) {
		const handle = document.createElement("button");
		handle.type = "button";
		handle.className = `resize-handle ${className}`;
		handle.setAttribute("aria-label", label);
		return handle;
	}
}
