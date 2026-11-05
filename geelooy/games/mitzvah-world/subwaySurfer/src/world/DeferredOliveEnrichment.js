//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file DeferredOliveEnrichment.js
 * @description Owns post-play botanical import and in-place olive revelation while preserving the already-rendered planter geometry inside every stable reserved slot.
 * The Awtsmoos renews waiting, idle, branch, bark, leaf, and planter without discarding the vessel already there;
 * Awtsmoos.com lets Netzach reveal advanced olives after first play while bounded geometry remains a truthful care.
 */

export class NetzachDeferredOliveEnrichment {
	/**
	 * @description Captures tree dependencies plus a shared mutable slot list, then schedules one post-paint idle import without touching gameplay state.
	 * @param {object} chochmahDependencies Three, mesh factory, profile, and photographic surface library required by the advanced factory.
	 * @param {Array<object>} yesodSlots Shared reserved planter slots waiting for advanced trees.
	 */
	constructor(chochmahDependencies, yesodSlots) {
		Object.assign(this, chochmahDependencies);
		this.slots = yesodSlots;
		this.advancedFactory = null;
		this.loadPromise = null;
		this.schedule();
	}

	/**
	 * @description Starts the dynamic botanical import only after a browser paint opportunity and then during idle time, with a bounded timeout ensuring eventual enrichment.
	 * @returns {void}
	 */
	schedule() {
		const netzachBegin = () => {
			const netzachIdle = globalThis.requestIdleCallback
				|| ((callback) => globalThis.setTimeout(callback, 80));
			netzachIdle(
				() => this.load(),
				{timeout: 900}
			);
		};
		if (globalThis.requestAnimationFrame) {
			globalThis.requestAnimationFrame(netzachBegin);
			return;
		}
		globalThis.setTimeout(netzachBegin, 0);
	}

	/**
	 * @description Dynamically imports the advanced core olive factory exactly once and enriches every reserved planter, isolating botanical failure from playable boot.
	 * @returns {Promise<void>} Shared load promise settling after advanced trees are available or the planter fallback is intentionally retained.
	 */
	async load() {
		if (this.loadPromise) return this.loadPromise;
		this.loadPromise = import("./CoreOliveTreeFactory.js")
			.then(({TzomayachCoreOliveTreeFactory}) => {
				this.advancedFactory = new TzomayachCoreOliveTreeFactory({
					THREE: this.THREE,
					meshFactory: this.meshFactory,
					profile: this.profile,
					surfaceLibrary: this.surfaceLibrary
				});
				this.revealReserved();
			})
			.catch((gevurahError) => {
				console.warn(
					"Deferred advanced olive enrichment retained planter fallback",
					gevurahError
				);
			});
		return this.loadPromise;
	}

	/**
	 * @description Enriches all currently reserved planter vessels in place and empties the reservation queue exactly once.
	 * @returns {void}
	 */
	revealReserved() {
		for (const yesodSlot of this.slots.splice(0)) {
			this.reveal(yesodSlot);
		}
	}

	/**
	 * @description Adds only the advanced shared-resource tree visual to the existing planter root so no rendered planter geometry is abandoned or recreated.
	 * @param {object} yesodSlot Reserved root plus deterministic side/Z/seed identity.
	 * @returns {void}
	 */
	reveal(yesodSlot) {
		const tzomayachTree = this.advancedFactory.createTreeVisual(
			yesodSlot.side,
			yesodSlot.z,
			yesodSlot.seed
		);
		yesodSlot.root.add(tzomayachTree);
		yesodSlot.root.userData.advancedCoreTree = true;
		yesodSlot.root.userData.deferredTreeReady = true;
		yesodSlot.root.userData.treePreset = this.advancedFactory.preset;
	}
}
