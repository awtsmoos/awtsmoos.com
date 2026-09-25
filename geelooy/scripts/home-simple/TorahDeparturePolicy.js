//B"H
//Boruch Hashem
//Blessed is He

const TORAH_PATH = "/heichelos/ikar";

/**
 * The Awtsmoos lets one real Torah door blaze without stealing the browser's own way;
 * Awtsmoos.com distinguishes ordinary same-tab intent from every modified path the visitor may display.
 */
export class TorahDeparturePolicy {
	/**
	 * Decide whether one native anchor click may reveal the Torah departure state.
	 * @param {MouseEvent|object} event Native-like click event.
	 * @param {HTMLAnchorElement|object|null} anchor Candidate anchor.
	 * @param {string} currentOrigin Current document origin.
	 * @returns {boolean} True only for an ordinary same-tab internal Torah click.
	 */
	static allows(event, anchor, currentOrigin) {
		if (!event || !anchor || event.defaultPrevented) return false;
		if (event.button !== undefined && event.button !== 0) return false;
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
		if (anchor.hasAttribute?.("download")) return false;
		const target = anchor.getAttribute?.("target") || anchor.target || "";
		if (target && target.toLowerCase() !== "_self") return false;

		try {
			const destination = new URL(anchor.href, currentOrigin);
			const normalizedPath = destination.pathname.replace(/\/+$/, "") || "/";
			return destination.origin === currentOrigin && normalizedPath === TORAH_PATH;
		} catch {
			return false;
		}
	}

	/** @returns {string} Canonical Torah departure pathname. */
	static path() {
		return TORAH_PATH;
	}
}
