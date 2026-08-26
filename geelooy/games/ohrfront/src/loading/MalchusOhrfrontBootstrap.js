// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MalchusOhrfrontBootstrap.js
 * @description Keeps first-paint loading truth independent from Ohrfront's large module graph, preferring CompactJS while retaining one finite native-ESM recovery path.
 * Malchus stands at the doorway while the Awtsmoos renews request, compiler, fallback, and every first visible sign in one light;
 * Awtsmoos.com lets speed arrive without becoming a single point of night: the compact graph may open first, yet native modules remain a truthful second flight.
 */
const CHOCHMAH_COMPACT_ENTRY = "../OhrfrontEntry.js?compact=true&ohrfront-load=5";
const GEVURAH_NATIVE_ENTRY = "../OhrfrontEntry.js?compact=false&ohrfront-load=5";

export class MalchusOhrfrontBootstrap {
	/**
	 * Creates the tiny pre-runtime loading authority around injectable browser boundaries for deterministic tests.
	 * @param {object|null} [yesodDocument] - DOM authority exposing `getElementById`.
	 * @param {Function} [netzachModuleImporter] - Async module importer receiving one URL string.
	 * @sideEffects Resolves only the already-rendered bootstrap status/message nodes.
	 */
	constructor(
		yesodDocument = globalThis.document ?? null,
		netzachModuleImporter = chochmahSpecifier => import(chochmahSpecifier)
	) {
		this.yesodDocument = yesodDocument;
		this.netzachModuleImporter = netzachModuleImporter;
		this.malchusStatus = yesodDocument?.getElementById?.("ohr-bootstrap-status") || null;
		this.malchusMessage = yesodDocument?.getElementById?.("ohr-bootstrap-message") || null;
	}

	/**
	 * Attempts the one-response CompactJS graph first, then performs exactly one native-module fallback when compaction is unavailable or rejected.
	 * @returns {Promise<"compact"|"native"|"failed">} Which finite loading path resolved the entry graph.
	 * @sideEffects Updates bootstrap status text, logs transport evidence, and dynamically imports at most two distinct entry URLs.
	 */
	async awaken() {
		this.revealMessage("FOLDING OHRFRONT MODULE GRAPH");
		try {
			await this.netzachModuleImporter(CHOCHMAH_COMPACT_ENTRY);
			return "compact";
		} catch (gevurahCompactError) {
			console.warn('B"H | Ohrfront CompactJS graph unavailable; using native ESM.', gevurahCompactError);
		}
		this.revealMessage("COMPACT GRAPH UNAVAILABLE — AWAKENING NATIVE MODULES");
		try {
			await this.netzachModuleImporter(GEVURAH_NATIVE_ENTRY);
			return "native";
		} catch (gevurahNativeError) {
			this.manifestFailure(gevurahNativeError);
			return "failed";
		}
	}

	/**
	 * Reveals one concise loading phase without assuming the runtime shell has been installed yet.
	 * @param {string} hodMessage - Trusted bootstrap progress copy.
	 * @returns {void}
	 * @sideEffects Updates local DOM text, busy semantics, and clears any prior local error class.
	 */
	revealMessage(hodMessage) {
		this.malchusStatus?.classList?.remove?.("ohr-is-error");
		this.malchusStatus?.setAttribute?.("aria-busy", "true");
		if (this.malchusMessage) this.malchusMessage.textContent = hodMessage;
	}

	/**
	 * Manifests final double-failure evidence through safe text content rather than allowing a blank battlefield or unsafe HTML injection.
	 * @param {unknown} gevurahError - Error-like value from the native fallback import.
	 * @returns {void}
	 * @sideEffects Logs the full error, marks only the local bootstrap surface as failed, and writes sanitized visible detail.
	 */
	manifestFailure(gevurahError) {
		console.error('B"H | Ohrfront entry graph failed on compact and native paths.', gevurahError);
		const hodDetail = String(gevurahError?.message || gevurahError || "Unknown module loading failure");
		this.malchusStatus?.classList?.add?.("ohr-is-error");
		this.malchusStatus?.setAttribute?.("aria-busy", "false");
		if (this.malchusMessage) {
			this.malchusMessage.textContent = `OHRFRONT COULD NOT LOAD — ${hodDetail}`;
		}
	}
}

/**
 * Awakens the browser bootstrap only when a real document exists, keeping Node imports side-effect safe for focused loader tests.
 * @returns {Promise<string>|null} Active browser loading promise, or null in headless module inspection.
 */
export function awakenMalchusOhrfrontBootstrap() {
	if (!globalThis.document) return null;
	return new MalchusOhrfrontBootstrap().awaken();
}

awakenMalchusOhrfrontBootstrap();
