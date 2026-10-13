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
 *
 * Unforgettable layer: parallax depth (three differential scroll speeds),
 * candle-lighting kindling when the dream awakens, a golden thread of
 * reading progress in the margin, and a brighter glow on the verse you are
 * reading now. Every effect is transform/opacity only; the scroll loop is a
 * single rAF-throttled listener that sleeps when the dream is off.
 *
 * Time-aware greeting: with no stored choice and no ?dream= link, the day
 * (05:00–17:00) opens in Dawn and the night in Sanctuary — never persisted,
 * so the greeting stays fresh until the reader chooses.
 */

import { KliReaderPreferenceController } from "./KliReaderPreferenceController.js";

const ALLOWED_DREAMS = ["off", "sanctuary", "dawn"];
const DEFAULT_DREAM = "off";
const STORAGE_KEY = "awtsmoos-dream";
const LIT_CLASS = "dream-verse-lit";
const NOW_CLASS = "dream-verse-now";
const VERSE_SELECTOR = ".awtsmoos-normal-verse-chunk, .awtsmoos-reader-section";
const KINDLE_STAGGER_MS = 120;
const KINDLE_MAX = 14;
const KINDLE_SCAN_CAP = 48;
const PARALLAX_FAR_FACTOR = 0.06;
const PARALLAX_MID_FACTOR = 0.16;
const DAWN_START_HOUR = 5;
const DAWN_END_HOUR = 17;

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
		this.nowObserver = null;
		this.contentWatcher = null;
		this.parallaxFar = null;
		this.parallaxMid = null;
		this.threadEl = null;
		this.onDreamScroll = null;
		this.onDreamResize = null;
		this.dreamTicking = false;
		this.dreamFrame = 0;
		this.maxScroll = 1;
	}

	/** @param {string} candidate Dream candidate. @returns {string} Supported dream. */
	normalizeDream(candidate) {
		return ALLOWED_DREAMS.includes(candidate) ? candidate : DEFAULT_DREAM;
	}

	/**
	 * @param {string} dreamName Dream to apply ("off" | "sanctuary" | "dawn").
	 * @param {object} [options] Transition options.
	 * @param {boolean} [options.cinematic] Play the awakening bloom (user toggles); silent on restore.
	 * @param {boolean} [options.persist] Persist the choice; false for the time-aware greeting.
	 * @returns {string} Applied dream.
	 */
	applyDream(dreamName, { cinematic = false, persist = true } = {}) {
		const normalizedDream = this.normalizeDream(dreamName);
		const wasOff = this.currentDream() === DEFAULT_DREAM;
		if (cinematic && normalizedDream !== DEFAULT_DREAM && wasOff && typeof document !== "undefined") {
			this.playAwakening(() => {
				this.commitDream(normalizedDream, { persist });
				this.kindleVerses();
			});
			return normalizedDream;
		}
		if (cinematic && normalizedDream !== DEFAULT_DREAM && typeof document !== "undefined") {
			this.playSoftCrossfade(() => this.commitDream(normalizedDream, { persist }));
			return normalizedDream;
		}
		if (cinematic && normalizedDream === DEFAULT_DREAM && typeof document !== "undefined") {
			this.playGentleFade(() => this.commitDream(normalizedDream, { persist }));
			return normalizedDream;
		}
		this.commitDream(normalizedDream, { persist });
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

	/**
	 * @param {string} normalizedDream Validated dream.
	 * @param {object} [options] Commit options.
	 * @param {boolean} [options.persist] Write the choice to storage.
	 * @returns {void}
	 */
	commitDream(normalizedDream, { persist = true } = {}) {
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
		if (persist) {
			this.store.write(STORAGE_KEY, normalizedDream);
		}
		const active = normalizedDream !== DEFAULT_DREAM;
		this.settleIllumination(active);
		this.settleDreamFx(active);
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

	/**
	 * Candle-lighting: when the dream awakens, the verses near the viewport
	 * ignite one after another, ~120ms apart, like candles being lit.
	 * @returns {void}
	 */
	kindleVerses() {
		const root = this.resolveMalchusRoot();
		if (!root || typeof window === "undefined") {
			return;
		}
		const vh = window.innerHeight || 800;
		const near = [];
		const candidates = root.querySelectorAll(`.dream-verse:not(.${LIT_CLASS})`);
		for (let i = 0; i < candidates.length && near.length < KINDLE_MAX && i < KINDLE_SCAN_CAP; i++) {
			const rect = candidates[i].getBoundingClientRect();
			if (rect.top < vh * 1.25 && rect.bottom > -vh * 0.25) {
				near.push(candidates[i]);
			}
		}
		if (this.reduceMotion()) {
			near.forEach(verse => verse.classList.add(LIT_CLASS));
			return;
		}
		near.forEach((verse, index) => {
			window.setTimeout(() => verse.classList.add(LIT_CLASS), index * KINDLE_STAGGER_MS);
		});
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
		// The verse you are reading now glows brighter than the rest.
		this.nowObserver = new IntersectionObserver(entries => {
			let best = null;
			let bestRatio = 0;
			for (const entry of entries) {
				if (entry.isIntersecting && entry.intersectionRatio > bestRatio) {
					best = entry.target;
					bestRatio = entry.intersectionRatio;
				}
			}
			if (best) {
				root.querySelectorAll(`.${NOW_CLASS}`).forEach(el => {
					if (el !== best) {
						el.classList.remove(NOW_CLASS);
					}
				});
				best.classList.add(NOW_CLASS);
			}
		}, { root: null, rootMargin: "-38% 0px -38% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] });
		const syncDreamDom = () => {
			this.tagDreamElements(root);
			root.querySelectorAll(VERSE_SELECTOR).forEach(verse => {
				if (!verse.classList.contains(LIT_CLASS)) {
					this.illuminationObserver.observe(verse);
				}
				this.nowObserver.observe(verse);
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
			.forEach(el => el.classList.remove("dream-glow-title", "dream-verse", "dream-control", "dream-link", "dream-field", LIT_CLASS, NOW_CLASS));
	}

	/** @returns {void} Disconnects observers and clears lit state. */
	teardownIllumination() {
		if (this.illuminationObserver) {
			this.illuminationObserver.disconnect();
			this.illuminationObserver = null;
		}
		if (this.nowObserver) {
			this.nowObserver.disconnect();
			this.nowObserver = null;
		}
		if (this.contentWatcher) {
			this.contentWatcher.disconnect();
			this.contentWatcher = null;
		}
		const root = this.resolveMalchusRoot();
		if (root) {
			root.querySelectorAll(`.${LIT_CLASS},.${NOW_CLASS}`).forEach(verse => verse.classList.remove(LIT_CLASS, NOW_CLASS));
		}
	}

	/**
	 * Builds one fixed parallax atmosphere layer on the body.
	 * @param {string} className Layer class. @returns {HTMLDivElement} The layer.
	 */
	makeParallaxLayer(className) {
		const layer = document.createElement("div");
		layer.className = className;
		layer.setAttribute("aria-hidden", "true");
		document.body.appendChild(layer);
		return layer;
	}

	/**
	 * Starts or stops the unforgettable effects: parallax depth layers and
	 * the golden thread of reading progress. One rAF-throttled scroll
	 * listener drives everything with transform/opacity only.
	 * @param {boolean} active Whether a dream is active. @returns {void}
	 */
	settleDreamFx(active) {
		this.teardownDreamFx();
		if (!active || typeof window === "undefined" || typeof document === "undefined") {
			return;
		}
		this.threadEl = document.createElement("div");
		this.threadEl.className = "dream-golden-thread";
		this.threadEl.setAttribute("aria-hidden", "true");
		const threadLine = document.createElement("div");
		threadLine.className = "dream-golden-thread-line";
		threadLine.setAttribute("aria-hidden", "true");
		this.threadEl.appendChild(threadLine);
		document.body.appendChild(this.threadEl);
		if (!this.reduceMotion()) {
			this.parallaxFar = this.makeParallaxLayer("dream-parallax-far");
			this.parallaxMid = this.makeParallaxLayer("dream-parallax-mid");
		}
		this.maxScroll = this.computeMaxScroll();
		this.dreamTicking = false;
		this.dreamFrame = 0;
		this.onDreamScroll = () => {
			if (!this.dreamTicking) {
				this.dreamTicking = true;
				requestAnimationFrame(() => this.updateDreamFx());
			}
		};
		this.onDreamResize = () => {
			this.maxScroll = this.computeMaxScroll();
		};
		window.addEventListener("scroll", this.onDreamScroll, { passive: true });
		window.addEventListener("resize", this.onDreamResize, { passive: true });
		this.updateDreamFx();
	}

	/** @returns {number} Scrollable distance, cached to avoid per-frame layout. */
	computeMaxScroll() {
		try {
			const doc = document.documentElement;
			return Math.max(1, (doc ? doc.scrollHeight : 1) - window.innerHeight);
		} catch {
			return 1;
		}
	}

	/** @returns {void} One rAF tick: parallax transforms + thread progress. */
	updateDreamFx() {
		this.dreamTicking = false;
		let y = 0;
		try {
			y = window.scrollY || 0;
		} catch {
			y = 0;
		}
		if (this.parallaxFar) {
			this.parallaxFar.style.transform = `translate3d(0,${(y * PARALLAX_FAR_FACTOR).toFixed(1)}px,0)`;
		}
		if (this.parallaxMid) {
			this.parallaxMid.style.transform = `translate3d(0,${(y * PARALLAX_MID_FACTOR).toFixed(1)}px,0)`;
		}
		this.dreamFrame += 1;
		if (this.dreamFrame % 60 === 0) {
			this.maxScroll = this.computeMaxScroll();
		}
		const progress = Math.min(1, Math.max(0, y / this.maxScroll));
		if (this.threadEl) {
			this.threadEl.style.setProperty("--dream-thread-p", progress.toFixed(4));
		}
	}

	/** @returns {void} Removes parallax layers, the golden thread, and the scroll loop. */
	teardownDreamFx() {
		if (typeof window !== "undefined") {
			if (this.onDreamScroll) {
				window.removeEventListener("scroll", this.onDreamScroll);
				this.onDreamScroll = null;
			}
			if (this.onDreamResize) {
				window.removeEventListener("resize", this.onDreamResize);
				this.onDreamResize = null;
			}
		}
		for (const el of [this.parallaxFar, this.parallaxMid, this.threadEl]) {
			if (el && el.parentNode) {
				el.parentNode.removeChild(el);
			}
		}
		this.parallaxFar = null;
		this.parallaxMid = null;
		this.threadEl = null;
		this.dreamTicking = false;
	}

	/** @returns {boolean} Whether the reader has ever chosen a dream. */
	hasStoredDream() {
		return this.store.has(STORAGE_KEY);
	}

	/**
	 * The fitting vision for a first-time visitor: Dawn through the day,
	 * Sanctuary at night. Never creepy — just the right light for the hour.
	 * @returns {string} "dawn" between 05:00–17:00, otherwise "sanctuary".
	 */
	timeDefaultDream() {
		try {
			const hour = new Date().getHours();
			return (hour >= DAWN_START_HOUR && hour < DAWN_END_HOUR) ? "dawn" : "sanctuary";
		} catch {
			return "dawn";
		}
	}

	/** @returns {void} Restores the dream and binds the authoritative selector once. */
	mount() {
		const selectorKli = /** @type {HTMLSelectElement|null} */ (this.resolveKli("dreamSelector"));
		const urlDream = this.dreamFromUrl();
		const storedDream = this.hasStoredDream()
			? this.store.readAllowed(STORAGE_KEY, ALLOWED_DREAMS, DEFAULT_DREAM)
			: DEFAULT_DREAM;
		// B"H A stored "off" is not an explicit preference — it means "not right
		// now", so the time-aware default still applies. Only a stored sanctuary
		// or dawn blocks the time default.
		const hasExplicitDream = storedDream === "sanctuary" || storedDream === "dawn";
		const rememberedDream = urlDream
			|| (hasExplicitDream ? storedDream : this.timeDefaultDream());
		if (selectorKli) {
			selectorKli.value = rememberedDream;
		}
		this.applyDream(rememberedDream, { persist: urlDream ? true : hasExplicitDream });
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
