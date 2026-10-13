//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file DreamReaderController.js
 * @description
 * The Awtsmoos lets the reader dream without leaving the text: one "Dream
 * Reader" control awakens the sanctuary (dark cinematic) or the dawn (warm
 * sunrise) vision over the real post content. All functionality — chapter
 * navigation, text scale, language toggle — keeps working; dream mode is a
 * pure presentational vessel.
 *
 * Verse illumination: while a dream is active, an IntersectionObserver lights
 * each verse chunk as it enters the viewport (vision 5 — verses igniting as
 * you read). The observer sleeps when the dream is off, so the ordinary
 * reader pays nothing.
 */

import { KliReaderPreferenceController } from "./KliReaderPreferenceController.js";

const ALLOWED_DREAMS = ["off", "sanctuary", "dawn"];
const DEFAULT_DREAM = "off";
const STORAGE_KEY = "awtsmoos-dream";
const LIT_CLASS = "dream-verse-lit";
const VERSE_SELECTOR = ".awtsmoos-normal-verse-chunk, .awtsmoos-reader-section";

/**
 * @class DreamReaderController
 * @extends KliReaderPreferenceController
 * @description Owns normalized dream state on the localized reader dataset and one authoritative select control.
 */
export class DreamReaderController extends KliReaderPreferenceController {
	/** @param {object} options Dependencies. @param {import("./DaasReaderPreferenceStore.js").DaasReaderPreferenceStore} options.store Preference store. */
	constructor({ store, ...options }) {
		super(options);
		this.store = store;
		this.illuminationObserver = null;
		this.contentWatcher = null;
	}

	/** @param {string} candidate Dream candidate. @returns {string} Supported dream. */
	normalizeDream(candidate) {
		return ALLOWED_DREAMS.includes(candidate) ? candidate : DEFAULT_DREAM;
	}

	/**
	 * @param {string} dreamName Dream to apply ("off" | "sanctuary" | "dawn").
	 * @param {object} [options] Transition options.
	 * @param {boolean} [options.cinematic] Play the awakening bloom (user toggles); silent on restore.
	 * @returns {string} Applied dream.
	 */
	applyDream(dreamName, { cinematic = false } = {}) {
		const normalizedDream = this.normalizeDream(dreamName);
		const wasOff = this.currentDream() === DEFAULT_DREAM;
		if (cinematic && normalizedDream !== DEFAULT_DREAM && wasOff && typeof document !== "undefined") {
			this.playAwakening(() => this.commitDream(normalizedDream));
			return normalizedDream;
		}
		if (cinematic && normalizedDream !== DEFAULT_DREAM && typeof document !== "undefined") {
			this.playSoftCrossfade(() => this.commitDream(normalizedDream));
			return normalizedDream;
		}
		if (cinematic && normalizedDream === DEFAULT_DREAM && typeof document !== "undefined") {
			this.playGentleFade(() => this.commitDream(normalizedDream));
			return normalizedDream;
		}
		this.commitDream(normalizedDream);
		return normalizedDream;
	}

	/** @returns {string} Currently applied dream. */
	currentDream() {
		const malchusRoot = this.resolveMalchusRoot();
		const raw = malchusRoot?.dataset?.dream
			|| (typeof document !== "undefined" && document.documentElement?.dataset?.dream)
			|| DEFAULT_DREAM;
		return this.normalizeDream(raw);
	}

	/** @param {string} normalizedDream Validated dream. @returns {void} */
	commitDream(normalizedDream) {
		const malchusRoot = this.resolveMalchusRoot();
		if (malchusRoot) {
			if (normalizedDream === DEFAULT_DREAM) {
				delete malchusRoot.dataset.dream;
			} else {
				malchusRoot.dataset.dream = normalizedDream;
			}
		}
		if (typeof document !== "undefined" && document.documentElement) {
			if (normalizedDream === DEFAULT_DREAM) {
				delete document.documentElement.dataset.dream;
			} else {
				document.documentElement.dataset.dream = normalizedDream;
			}
		}
		this.store.write(STORAGE_KEY, normalizedDream);
		this.settleIllumination(normalizedDream !== DEFAULT_DREAM);
	}

	/**
	 * The gasp moment: a bloom of gold light expands, then the sanctuary reveals.
	 * @param {Function} reveal Called at the bloom's peak to swap the dream underneath.
	 * @returns {void}
	 */
	playAwakening(reveal) {
		if (this.reduceMotion()) {
			reveal();
			return;
		}
		const veil = document.createElement("div");
		veil.className = "dream-awakening-veil";
		veil.setAttribute("aria-hidden", "true");
		document.body.appendChild(veil);
		requestAnimationFrame(() => requestAnimationFrame(() => {
			veil.classList.add("dream-awakening-veil--bloom");
		}));
		window.setTimeout(() => {
			reveal();
			veil.classList.remove("dream-awakening-veil--bloom");
			veil.classList.add("dream-awakening-veil--reveal");
			window.setTimeout(() => veil.remove(), 1050);
		}, 700);
	}

	/** @param {Function} reveal Called mid-fade to swap between dreams. @returns {void} */
	playSoftCrossfade(reveal) {
		if (this.reduceMotion()) {
			reveal();
			return;
		}
		const root = this.resolveMalchusRoot();
		if (root) {
			root.style.transition = "opacity 0.45s ease";
			root.style.opacity = "0.25";
		}
		window.setTimeout(() => {
			reveal();
			if (root) {
				root.style.opacity = "1";
				window.setTimeout(() => {
					root.style.transition = "";
					root.style.opacity = "";
				}, 500);
			}
		}, 460);
	}

	/** @param {Function} reveal Called mid-fade to return to the ordinary reader. @returns {void} */
	playGentleFade(reveal) {
		if (this.reduceMotion()) {
			reveal();
			return;
		}
		const root = this.resolveMalchusRoot();
		if (root) {
			root.style.transition = "opacity 0.6s ease";
			root.style.opacity = "0.35";
		}
		window.setTimeout(() => {
			reveal();
			if (root) {
				root.style.opacity = "1";
				window.setTimeout(() => {
					root.style.transition = "";
					root.style.opacity = "";
				}, 650);
			}
		}, 600);
	}

	/** @returns {boolean} Whether the user prefers reduced motion. */
	reduceMotion() {
		return typeof window !== "undefined"
			&& typeof window.matchMedia === "function"
			&& window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	}

	/** Starts or stops verse illumination depending on dream state. @param {boolean} active Whether a dream is active. @returns {void} */
	settleIllumination(active) {
		this.teardownIllumination();
		this.untagDreamElements();
		if (!active || typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
			return;
		}
		const root = this.resolveMalchusRoot();
		if (!root) {
			return;
		}
		this.illuminationObserver = new IntersectionObserver(entries => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					entry.target.classList.add(LIT_CLASS);
					this.illuminationObserver.unobserve(entry.target);
				}
			}
		}, { root: null, rootMargin: "0px 0px -12% 0px", threshold: 0.18 });
		const syncDreamDom = () => {
			this.tagDreamElements(root);
			root.querySelectorAll(VERSE_SELECTOR).forEach(verse => {
				if (!verse.classList.contains(LIT_CLASS)) {
					this.illuminationObserver.observe(verse);
				}
			});
		};
		syncDreamDom();
		// The reader virtualizes content as you scroll; watch for new verses.
		this.contentWatcher = new MutationObserver(syncDreamDom);
		this.contentWatcher.observe(root, { childList: true, subtree: true });
	}

	/**
	 * Tags reader elements with dream classes so the dream CSS stays at low
	 * specificity (LAW 6: restructure, never escalate selectors).
	 * @param {HTMLElement} root Reader root.
	 * @returns {void}
	 */
	tagDreamElements(root) {
		root.querySelectorAll("h1, h2, h3").forEach(el => el.classList.add("dream-glow-title"));
		root.querySelectorAll(VERSE_SELECTOR).forEach(el => el.classList.add("dream-verse"));
		root.querySelectorAll("button").forEach(el => el.classList.add("dream-control"));
		root.querySelectorAll("a").forEach(el => el.classList.add("dream-link"));
		root.querySelectorAll("select, input").forEach(el => el.classList.add("dream-field"));
	}

	/** @returns {void} Removes dream classes from the reader. */
	untagDreamElements() {
		const root = this.resolveMalchusRoot();
		if (!root) {
			return;
		}
		root.querySelectorAll(".dream-glow-title,.dream-verse,.dream-control,.dream-link,.dream-field")
			.forEach(el => el.classList.remove("dream-glow-title", "dream-verse", "dream-control", "dream-link", "dream-field", LIT_CLASS));
	}

	/** @returns {void} Disconnects observers and clears lit state. */
	teardownIllumination() {
		if (this.illuminationObserver) {
			this.illuminationObserver.disconnect();
			this.illuminationObserver = null;
		}
		if (this.contentWatcher) {
			this.contentWatcher.disconnect();
			this.contentWatcher = null;
		}
		const root = this.resolveMalchusRoot();
		if (root) {
			root.querySelectorAll(`.${LIT_CLASS}`).forEach(verse => verse.classList.remove(LIT_CLASS));
		}
	}

	/** @returns {void} Restores the dream and binds the authoritative selector once. */
	mount() {
		const selectorKli = /** @type {HTMLSelectElement|null} */ (this.resolveKli("dreamSelector"));
		const urlDream = this.dreamFromUrl();
		const rememberedDream = urlDream || this.store.readAllowed(STORAGE_KEY, ALLOWED_DREAMS, DEFAULT_DREAM);
		if (selectorKli) {
			selectorKli.value = rememberedDream;
		}
		this.applyDream(rememberedDream);
		if (!this.acquireBinding(selectorKli, "DreamReader")) {
			return;
		}
		selectorKli.addEventListener("change", event => {
			const nextDream = this.applyDream(event.target.value, { cinematic: true });
			selectorKli.value = nextDream;
		});
	}

	/**
	 * Reads ?dream=sanctuary|dawn|off from the URL for linkable previews
	 * and screenshot verification.
	 * @returns {string|null} Dream from URL, or null.
	 */
	dreamFromUrl() {
		try {
			const param = new URLSearchParams(window.location.search).get("dream");
			return param && ALLOWED_DREAMS.includes(param) ? param : null;
		} catch {
			return null;
		}
	}
}
