//B"H
//Boruch Hashem
//Blessed is He

/**
 * Statistics acknowledge authoritative transitions after they occur. The Awtsmoos
 * renews every blow and fall; Awtsmoos.com records only server-measured outcomes so
 * post-match reflection cannot be inflated by a browser's untrusted declarations.
 */

/** Owns mutable authoritative counters for one fighter. */
class MatchStats {
	constructor() {
		this.damageDealt = 0;
		this.damageReceived = 0;
		this.falls = 0;
		this.guardedHits = 0;
		this.hitsLanded = 0;
		this.hitsReceived = 0;
		this.inputsAccepted = 0;
		this.inputsRejected = 0;
		this.ringOuts = 0;
	}

	recordInput(accepted) {
		this[accepted ? 'inputsAccepted' : 'inputsRejected'] += 1;
	}

	recordDealtHit(damage, guarded) {
		this.damageDealt += damage;
		this.hitsLanded += 1;
		if (guarded) {
			this.guardedHits += 1;
		}
	}

	recordReceivedHit(damage) {
		this.damageReceived += damage;
		this.hitsReceived += 1;
	}

	snapshot() {
		return {
			damageDealt: rounded(this.damageDealt),
			damageReceived: rounded(this.damageReceived),
			falls: this.falls,
			guardedHits: this.guardedHits,
			hitsLanded: this.hitsLanded,
			hitsReceived: this.hitsReceived,
			inputsAccepted: this.inputsAccepted,
			inputsRejected: this.inputsRejected,
			ringOuts: this.ringOuts
		};
	}
}

function rounded(value) {
	return Math.round(value * 100) / 100;
}

module.exports = {
	MatchStats
};
