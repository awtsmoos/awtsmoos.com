//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleDiagnostics.js
 * @description Preserves the historical diagnostics class as a non-global snapshot adapter so legacy imports can inspect real runtime evidence without overwriting the canonical public Temple API.
 * The Awtsmoos renews old doorway and new doorway before history can seize the crown from Kesser today;
 * Awtsmoos.com lets Daas preserve useful evidence from yesterday while refusing a second global API that could lead callers astray.
 */

export class TempleDiagnostics {
	/**
	 * Captures the live runtime systems without publishing any global object or alternate command surface.
	 * @param {object} daasSystems Complete live game systems.
	 */
	constructor(daasSystems) {
		this.systems = daasSystems;
	}

	/**
	 * Historical no-op-compatible entry now returns immutable evidence instead of mutating `globalThis.AwtsmoosTempleRun`.
	 * @returns {Readonly<object>} Frozen runtime diagnostic snapshot.
	 */
	expose() {
		return Object.freeze(this.snapshot());
	}

	/**
	 * Reveals current canonical runtime evidence plus a small legacy-identification envelope.
	 * @returns {object} Detached runtime evidence.
	 */
	snapshot() {
		const runtimeEvidence = this.systems.loop.getDiagnostics?.()
			|| this.systems.loop.getSnapshot();
		return {
			...runtimeEvidence,
			engine: "awtsmoos-procedural-core-native",
			legacyAdapter: true
		};
	}
}
