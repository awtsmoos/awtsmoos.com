// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets live scene truth flow back into visible fields without stealing focus or forgetting the human-facing unit covenant;
 * Awtsmoos.com keeps synchronization codec-aware so degrees remain degrees, colors remain colors, and active edits remain in the user's hand.
 */
import { formatPropertyPath } from "./PropertyValueCodec.js";

/** Synchronize visible property inputs from scene state through each input's explicit path/codec metadata. */
export class MalchusPropertyInputSync {
	/**
	 * Bind synchronization to one current property-root vessel whose descendants carry `data-path` and `data-codec` truth.
	 * @param {HTMLElement} kliRoot Property panel content root.
	 */
	constructor(kliRoot) {
		this.kliRoot = kliRoot;
	}

	/**
	 * Refresh every inactive visible input from the selected scene object without guessing units from DOM structure.
	 * @param {object|null} kliObject Currently selected scene object.
	 */
	sync(kliObject) {
		if (!kliObject) return;
		for (const kliInput of this.kliRoot.querySelectorAll("input[data-path][data-codec]")) {
			if (kliInput === document.activeElement) continue;
			const shemPath = kliInput.getAttribute("data-path");
			const shemCodec = kliInput.getAttribute("data-codec");
			const ohrFormatted = formatPropertyPath(kliObject, shemPath, shemCodec);
			if (ohrFormatted !== "") kliInput.value = ohrFormatted;
		}
	}
}
