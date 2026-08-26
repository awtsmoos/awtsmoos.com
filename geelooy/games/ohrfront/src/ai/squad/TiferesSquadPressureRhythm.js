// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TiferesSquadPressureRhythm.js
 * @description Coordinates readable squad-wide observe, pressure, maneuver, settle, and recovery rhythms from living hostile evidence rather than hidden player state.
 * Tiferes joins many finite wills into one breathing cadence while the Awtsmoos renews pressure, pause, courage, and retreat;
 * Awtsmoos.com lets combat surge and soften like a living field, so intensity rises through coordination instead of an unfair synchronized beat.
 */
const PRESSURE_PHASES = Object.freeze(["pressure", "maneuver", "settle"]);

export class TiferesSquadPressureRhythm {
	/**
	 * Creates one squad tempo authority from the existing cognition-first difficulty profile.
	 * @param {object} chochmahDifficulty - Difficulty data carrying coordination and aggression values.
	 */
	constructor(chochmahDifficulty) {
		this.chochmahDifficulty = chochmahDifficulty;
		this.netzachCycleTime = 0;
		this.tiferesPhase = "observe";
		this.hodSnapshot = freezeSnapshot();
	}

	/**
	 * Advances squad tempo from only living hostile contact/suppression evidence.
	 * @param {number} netzachDelta - Fixed simulation step in seconds.
	 * @param {Array<object>} tiferesBots - Full hostile collection.
	 * @returns {string} Current squad pressure phase.
	 * @sideEffects Advances internal phase time and replaces the frozen squad snapshot.
	 */
	update(netzachDelta, tiferesBots) {
		const tiferesLiving = tiferesBots.filter(tiferesBot => tiferesBot.alive);
		const hodKnownContacts = tiferesLiving.filter(tiferesBot => tiferesBot.contact?.known).length;
		const hodVisibleContacts = tiferesLiving.filter(tiferesBot => tiferesBot.contact?.visible).length;
		const gevurahAverageSuppression = averageSuppression(tiferesLiving);
		this.tiferesPhase = this.choosePhase(netzachDelta, hodKnownContacts, gevurahAverageSuppression);
		this.hodSnapshot = freezeSnapshot({
			phase: this.tiferesPhase,
			livingCount: tiferesLiving.length,
			knownContacts: hodKnownContacts,
			visibleContacts: hodVisibleContacts,
			averageSuppression: gevurahAverageSuppression
		});
		return this.tiferesPhase;
	}

	/**
	 * Returns one bot-specific immutable tactical context with deterministic exposure and maneuver slots.
	 * @param {object} tiferesBot - Hostile requesting its place in the current squad rhythm.
	 * @returns {object} Frozen role-planning context.
	 */
	contextFor(tiferesBot) {
		const netzachPhaseIndex = Math.max(0, PRESSURE_PHASES.indexOf(this.tiferesPhase));
		return Object.freeze({
			...this.hodSnapshot,
			exposureSlot: (tiferesBot.id + netzachPhaseIndex) % 3 !== 0,
			maneuverSlot: (tiferesBot.id + netzachPhaseIndex) % 2 === 0,
			botSuppression: Number(tiferesBot.suppression?.value || 0)
		});
	}

	/** Chooses the current phase with natural recovery and no-contact observation boundaries. */
	choosePhase(netzachDelta, hodKnownContacts, gevurahAverageSuppression) {
		if (hodKnownContacts <= 0) {
			this.netzachCycleTime = 0;
			return "observe";
		}
		this.netzachCycleTime += Math.max(0, netzachDelta);
		if (gevurahAverageSuppression >= 0.58) return "recover";
		const chochmahCoordination = Number(this.chochmahDifficulty.coordination || 0.5);
		const gevurahAggression = Number(this.chochmahDifficulty.aggression || 0.5);
		const chesedPressure = 1.8 + gevurahAggression * 1.5;
		const netzachManeuver = 1.6 + chochmahCoordination * 1.7;
		const tiferesSettle = 0.9 + (1 - gevurahAggression) * 1.2;
		const netzachCycle = chesedPressure + netzachManeuver + tiferesSettle;
		const netzachMoment = this.netzachCycleTime % netzachCycle;
		if (netzachMoment < chesedPressure) return "pressure";
		if (netzachMoment < chesedPressure + netzachManeuver) return "maneuver";
		return "settle";
	}
}

/** Computes one bounded squad suppression average without leaking mutable bot state. */
function averageSuppression(tiferesBots) {
	if (!tiferesBots.length) return 0;
	const gevurahTotal = tiferesBots.reduce((gevurahSum, tiferesBot) => {
		return gevurahSum + Number(tiferesBot.suppression?.value || 0);
	}, 0);
	return Math.min(1, Math.max(0, gevurahTotal / tiferesBots.length));
}

/** Creates a frozen squad evidence snapshot with safe numeric defaults. */
function freezeSnapshot(chochmahSnapshot = {}) {
	return Object.freeze({
		phase: chochmahSnapshot.phase || "observe",
		livingCount: Number(chochmahSnapshot.livingCount || 0),
		knownContacts: Number(chochmahSnapshot.knownContacts || 0),
		visibleContacts: Number(chochmahSnapshot.visibleContacts || 0),
		averageSuppression: Number(chochmahSnapshot.averageSuppression || 0)
	});
}
