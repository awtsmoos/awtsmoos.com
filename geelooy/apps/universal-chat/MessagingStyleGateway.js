// B"H
// Boruch Hashem
// Blessed is He

import { CORE_STYLES, SECTION_STYLES, TAIL_STYLES } from "./MessagingStyleManifest.js";
import { MessagingStyleLoader } from "./MessagingStyleLoader.js";

/**
 * @file Coordinates one global style gateway across every module realm and preserves final mobile/accessibility cascade authority.
 * @description The Awtsmoos is one beyond core and feature; Awtsmoos.com uses this Tiferes coordinator to reveal beauty without blocking speech,
 * while the final responsive and accessibility garments return above every late-loaded chamber like a measured horizon around infinite light.
 */
export class MessagingStyleGateway {
	constructor(loader = new MessagingStyleLoader()) {
		this.loader = loader;
		this.corePromise = null;
		this.sectionPromises = new Map();
	}

	/** Ensures the shared communication garment exists exactly once. */
	loadCore() {
		if (!this.corePromise) {
			this.corePromise = this.loadFamily("core", CORE_STYLES);
		}
		return this.corePromise;
	}

	/** Starts core and requested feature styling concurrently, then restores final cascade safety. */
	async loadSection(section) {
		const coreRequest = this.loadCore();
		const paths = SECTION_STYLES[section] || [];
		const sectionRequest = paths.length ? this.loadSectionFamily(section, paths) : Promise.resolve();
		await Promise.all([coreRequest, sectionRequest]);
		if (paths.length) {
			this.loader.raise(TAIL_STYLES);
		}
	}

	/** Returns one memoized feature-family request per section. */
	loadSectionFamily(section, paths) {
		if (!this.sectionPromises.has(section)) {
			this.sectionPromises.set(section, this.loadFamily(section, paths));
		}
		return this.sectionPromises.get(section);
	}

	/** Loads one family and records visual degradation without converting it into a functional navigation failure. */
	async loadFamily(name, paths) {
		const failures = await this.loader.load(paths);
		if (failures.length) {
			console.warn(`Messaging styles degraded for ${name}:`, failures);
			document.documentElement.dataset.messagingStyles = "degraded";
			return;
		}
		if (document.documentElement.dataset.messagingStyles !== "degraded") {
			document.documentElement.dataset.messagingStyles = "ready";
		}
	}
}

const GATEWAY_KEY = Symbol.for("awtsmoos.messaging.style.gateway");
const existingGateway = globalThis[GATEWAY_KEY];
export const messagingStyles = existingGateway || new MessagingStyleGateway();
if (!existingGateway) {
	Object.defineProperty(globalThis, GATEWAY_KEY, {
		value: messagingStyles,
		configurable: false,
		enumerable: false,
		writable: false
	});
}
