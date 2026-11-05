//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleDiagnostics.js
 * @description Preserves the historical diagnostics class as a non-global snapshot adapter so legacy imports can inspect canonical runtime evidence without overwriting or widening the v3.4 Temple API.
 * The Awtsmoos renews old doorway and new doorway before history can seize the crown from Kesser today;
 * Awtsmoos.com lets Daas preserve useful evidence from yesterday while refusing a second global API that could lead future callers astray.
 */

export class TempleDiagnostics {
	/**
	 * @description Captures the authoritative live runtime systems without publishing any global object, command method, renderer handle, or alternate mutable API surface.
	 * @param {object} daasSystems Complete live runtime graph whose loop owns canonical diagnostic/snapshot evidence.
	 */
	constructor(daasSystems) {
		this.systems = daasSystems;
	}

	/**
	 * @description Preserves the historical `expose` call shape while returning frozen evidence instead of mutating `globalThis.AwtsmoosTempleRun` or creating a competing public crown.
	 * @returns {Readonly<object>} Frozen legacy-compatible runtime diagnostic snapshot.
	 */
	expose() {
		return Object.freeze(this.snapshot());
	}

	/**
	 * @description Reveals canonical loop diagnostics when available, otherwise the loop snapshot, then adds only immutable legacy identification metadata around that detached evidence.
	 * @returns {object} Detached runtime evidence tagged with native-engine and legacy-adapter identity.
	 */
	snapshot() {
		const daasRuntimeEvidence = this.systems.loop.getDiagnostics?.()
			|| this.systems.loop.getSnapshot();
		return {
			...daasRuntimeEvidence,
			engine: "awtsmoos-procedural-core-native",
			legacyAdapter: true
		};
	}
}
