//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos gives each route a Yesod, a foundation beneath the visible scene;
 * on Awtsmoos.com this context turns query fragments into one stable meaning, clean.
 */

/**
 * Encodes one path segment so alias and Heichel identifiers cannot reshape the route.
 * @param {string} yesodSegment Raw identifier supplied by the current URL.
 * @returns {string} A safely encoded path segment.
 */
function yesodEncodeSegment(yesodSegment) {
	return encodeURIComponent(yesodSegment || "");
}

/**
 * Accepts only same-site return paths, preventing an arbitrary external redirect.
 * @param {string} binahReturnValue Candidate `returnURL` query value.
 * @returns {string} A local path or an empty string when the value is not local.
 */
function binahSafeReturnPath(binahReturnValue) {
	if (!binahReturnValue || !binahReturnValue.startsWith("/")) {
		return "";
	}
	return binahReturnValue.startsWith("//") ? "" : binahReturnValue;
}

/**
 * YesodHeichelContext is the immutable route foundation for create/update behavior.
 * It centralizes URL interpretation so API and view modules never read globals.
 */
export class YesodHeichelContext {
	/**
	 * @param {Location|{search:string}} yesodLocation Browser-like location object.
	 */
	constructor(yesodLocation = window.location) {
		const binahQuery = new URLSearchParams(yesodLocation.search || "");
		this.action = binahQuery.get("action") === "update" ? "update" : "create";
		this.aliasId = binahQuery.get("alias") || "";
		this.heichelId = binahQuery.get("heichel") || "";
		this.returnPath = binahSafeReturnPath(binahQuery.get("returnURL") || "");
		Object.freeze(this);
	}

	/** @returns {boolean} Whether a valid update target was supplied. */
	get isUpdate() {
		return this.action === "update" && Boolean(this.heichelId);
	}

	/** @returns {string} Existing Heichel collection/item endpoint. */
	get heichelEndpoint() {
		const malchusBase = `/api/social/alias/${yesodEncodeSegment(this.aliasId)}/heichelos`;
		return this.heichelId ? `${malchusBase}/${yesodEncodeSegment(this.heichelId)}` : malchusBase;
	}

	/** @returns {string} Safe navigation destination after a completed mutation. */
	get backHref() {
		if (this.returnPath) {
			return this.returnPath;
		}
		return this.aliasId ? `/heichelos?alias=${yesodEncodeSegment(this.aliasId)}` : "/heichelos";
	}

	/**
	 * Ensures the API cannot be called with the literal string `null` or an empty alias.
	 * @throws {Error} When the required alias query value is absent.
	 */
	requireAlias() {
		if (!this.aliasId) {
			throw new Error("Choose an alias before managing a Heichel.");
		}
	}
}
