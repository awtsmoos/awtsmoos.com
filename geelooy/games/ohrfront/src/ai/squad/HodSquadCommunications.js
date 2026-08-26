// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HodSquadCommunications.js
 * @description Owns delayed sight reports and imperfect hearing as renderer-neutral evidence communication independent from cover reservations.
 * Hod gives partial battlefield knowledge a finite voice while the Awtsmoos remains beyond sender, receiver, certainty, and sound;
 * Awtsmoos.com lets squad communication remain pure domain law, directly testable without constructing a renderer or native vector factory.
 */
import { distance } from "../../core/vector/GevurahVectorMeasure.js";

export class HodSquadCommunications {
	/**
	 * Creates delayed communication state around one cognition-focused difficulty profile.
	 * @param {object} chochmahDifficulty - Difficulty profile controlling coordination, communication delay, and hearing radius.
	 * @sideEffects Initializes local time and pending-report queue only.
	 */
	constructor(chochmahDifficulty) {
		this.chochmahDifficulty = chochmahDifficulty;
		this.netzachTime = 0;
		this.hodReports = [];
	}

	/**
	 * Advances communication time and delivers only reports whose intentional delay has matured.
	 * @param {number} netzachDelta - Fixed simulation step in seconds.
	 * @param {Array<object>} tiferesBots - Full hostile squad collection.
	 * @returns {void}
	 * @sideEffects Advances local time, may update recipient contact memories, and compacts the pending report queue.
	 */
	update(netzachDelta, tiferesBots) {
		this.netzachTime += netzachDelta;
		const netzachFutureReports = [];
		for (const hodReport of this.hodReports) {
			if (hodReport.deliverAt > this.netzachTime) netzachFutureReports.push(hodReport);
			else this.deliver(hodReport, tiferesBots);
		}
		this.hodReports = netzachFutureReports;
	}

	/**
	 * Queues one rate-limited delayed report from a hostile that currently has direct visible contact.
	 * @param {object} tiferesBot - Seeing hostile whose contact memory is the only source of report position.
	 * @returns {boolean} True when a new report enters the delayed queue.
	 * @sideEffects May update sender report cadence and append one cloned report record.
	 */
	shareSight(tiferesBot) {
		if (!tiferesBot.contact.visible || this.netzachTime < (tiferesBot.nextReportAt || 0)) return false;
		tiferesBot.nextReportAt = this.netzachTime + 0.7;
		this.hodReports.push({
			senderId: tiferesBot.id,
			position: tiferesBot.contact.position.clone(),
			confidence: 0.58 + (this.chochmahDifficulty.coordination || 0.5) * 0.22,
			deliverAt: this.netzachTime + (this.chochmahDifficulty.communicationDelay || 0.6)
		});
		return true;
	}

	/**
	 * Gives nearby living hostiles intentionally imprecise auditory evidence around a loud event location.
	 * @param {Array<object>} tiferesBots - Squad that may hear the event.
	 * @param {object} chochmahSoundPosition - World position of the audible event.
	 * @returns {number} Number of living hostiles receiving auditory contact evidence.
	 * @sideEffects May update contact memory through `hear`; never grants visibility or exact future tracking.
	 */
	hearShot(tiferesBots, chochmahSoundPosition) {
		const gevurahRadius = this.chochmahDifficulty.hearing || 42;
		let hodHearers = 0;
		for (const tiferesBot of tiferesBots) {
			if (!tiferesBot.alive || distance(tiferesBot.group.position, chochmahSoundPosition) > gevurahRadius) continue;
			const hodUncertainPosition = chochmahSoundPosition.clone();
			const gevurahError = 7 * (1 - (this.chochmahDifficulty.coordination || 0.5));
			hodUncertainPosition.x += Math.sin(tiferesBot.id * 7.13) * gevurahError;
			hodUncertainPosition.z += Math.cos(tiferesBot.id * 5.71) * gevurahError;
			tiferesBot.contact.hear(hodUncertainPosition, 0.36 + (this.chochmahDifficulty.coordination || 0.5) * 0.12);
			hodHearers += 1;
		}
		return hodHearers;
	}

	/**
	 * Delivers one matured report to every other living hostile as reported contact rather than direct sight.
	 * @param {object} hodReport - Matured cloned report record.
	 * @param {Array<object>} tiferesBots - Potential recipients.
	 * @returns {void}
	 * @sideEffects May update recipient contact memories through `report`.
	 */
	deliver(hodReport, tiferesBots) {
		for (const tiferesBot of tiferesBots) {
			if (!tiferesBot.alive || tiferesBot.id === hodReport.senderId) continue;
			tiferesBot.contact.report(hodReport.position, hodReport.confidence);
		}
	}
}
