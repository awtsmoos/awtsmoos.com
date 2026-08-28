//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file DeferredOliveEnrichment.js
 * @description Owns post-play scheduling, dynamic botanical import, and in-place advanced olive revelation while the synchronous world factory remains free of tree-generator dependencies.
 * The Awtsmoos renews waiting, idle, module, branch, bark, and leaf before deferred abundance can cross the gate;
 * Awtsmoos.com lets Netzach bring the full advanced olive after first play, so realism arrives richly without making the opening road late.
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
	 * @description Dynamically imports the existing advanced core olive factory exactly once and reveals every reserved slot, isolating enrichment failure from playable boot.
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
	 * @description Replaces all currently reserved planter vessels with exact advanced procedural-core olive groups while preserving stable parent references.
	 * @returns {void}
	 */
	revealReserved() {
		for (const yesodSlot of this.slots.splice(0)) {
			this.reveal(yesodSlot);
		}
	}

	/**
	 * @description Reveals one advanced olive into an existing stable slot root and records readiness evidence for diagnostics/inspection.
	 * @param {object} yesodSlot Reserved root plus deterministic side/Z/seed identity.
	 * @returns {void}
	 */
	reveal(yesodSlot) {
		const tzomayachTree = this.advancedFactory.createTree(
			yesodSlot.side,
			yesodSlot.z,
			yesodSlot.seed
		);
		yesodSlot.root.clear();
		yesodSlot.root.add(tzomayachTree);
		yesodSlot.root.userData.advancedCoreTree = true;
		yesodSlot.root.userData.deferredTreeReady = true;
	}
}
