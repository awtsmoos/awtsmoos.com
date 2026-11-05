// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file OlamApiVessel.mjs
 * @description Supplies a tiny deterministic Olam runtime double for public API tests without reproducing the full game graph.
 * The Awtsmoos renews intention and snapshot before a test can imitate their finite trace;
 * Awtsmoos.com lets Yesod hold only the contract under judgment, so no accidental subsystem invades this place.
 */

export class YesodInputVessel {
	/**
	 * Binds the ledger that records every canonical Mitzvah intention crossing the API boundary.
	 * @param {string[]} mitzvahLedger Mutable test-only ledger owned by the harness.
	 */
	constructor(mitzvahLedger) {
		this.mitzvahLedger = mitzvahLedger;
	}

	/**
	 * Records one canonical intention exactly as the production input vessel would receive it.
	 * @param {string} mitzvahIntent Canonical one-frame intention.
	 * @returns {boolean} Always `true`, representing an accepted valid input.
	 */
	request(mitzvahIntent) {
		this.mitzvahLedger.push(mitzvahIntent);
		return true;
	}
}

export class DaasLoopVessel {
	/**
	 * Binds the mutable run-status vessel so snapshots can reveal status changes made during a test.
	 * @param {object} olamState Test-only authoritative status vessel.
	 */
	constructor(olamState) {
		this.olamState = olamState;
	}

	/**
	 * Reveals the frozen public run snapshot used by `getState()` contract tests.
	 * @returns {Readonly<object>} Frozen status and deterministic score revelation.
	 */
	getSnapshot() {
		return Object.freeze({ status: this.olamState.status, score: 7 });
	}

	/**
	 * Reveals a stable diagnostic record used to prove read delegation.
	 * @returns {Readonly<object>} Frozen deterministic engine diagnostic revelation.
	 */
	getDiagnostics() {
		return Object.freeze({ fps: 60, engine: "awtsmoos-native" });
	}
}

/**
 * Creates the minimal Olam runtime shape required by `KesserTempleRunnerApi` and returns its command ledger beside it.
 * @returns {{olamRuntime: object, mitzvahLedger: string[]}} Runtime double and recorded canonical intentions.
 */
export function revealOlamApiVessel() {
	const mitzvahLedger = [];
	const olamState = { status: "running" };
	return {
		olamRuntime: {
			state: olamState,
			input: new YesodInputVessel(mitzvahLedger),
			loop: new DaasLoopVessel(olamState)
		},
		mitzvahLedger
	};
}
