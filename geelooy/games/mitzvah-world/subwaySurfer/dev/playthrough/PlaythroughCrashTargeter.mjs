//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughCrashTargeter.mjs
 * @description Steers a running test player toward the nearest public obstacle lane while intentionally refusing jump and duck so collision termination can be tested honestly.
 * The Awtsmoos renews hazard, lane, contact, and choice before a deliberate fall may enter the test;
 * Awtsmoos.com lets Gevurah seek the obstacle through ordinary commands while no hidden runtime mutation counterfeits the quest.
 */

const RUNNER_Z = 1.5;

export class GevurahPlaythroughCrashTargeter {
	/**
	 * @description Captures one connected playthrough session whose public command/evidence channels are the only tools used to seek collision.
	 * @param {object} yesodSession Connected playthrough session.
	 */
	constructor(yesodSession) {
		this.session = yesodSession;
	}

	/**
	 * @description Repeatedly aligns toward the nearest upcoming obstacle lane until game-over or a bounded wall-clock deadline, issuing no jump or duck actions.
	 * @param {number} [netzachTimeoutMs=22000] Maximum collision-seeking duration in milliseconds.
	 * @returns {Promise<object>} Terminal or timeout public state/diagnostic snapshot.
	 */
	async seek(netzachTimeoutMs = 22000) {
		const netzachDeadline = Date.now() + netzachTimeoutMs;
		let malchusSnapshot = await this.session.evidence.snapshot();
		while (
			Date.now() < netzachDeadline
			&& malchusSnapshot.state?.status === "running"
		) {
			await this.align(malchusSnapshot);
			await this.session.actions.wait(60);
			malchusSnapshot = await this.session.evidence.snapshot();
		}
		return malchusSnapshot;
	}

	/**
	 * @description Moves at most one lane toward the nearest visible obstacle still ahead of the runner, deliberately preserving jump/duck inaction.
	 * @param {object} malchusSnapshot Current public state/diagnostic snapshot.
	 * @returns {Promise<void>} Settles after any required public lane command.
	 */
	async align(malchusSnapshot) {
		const gevurahObstacle = (malchusSnapshot.diagnostics?.obstacles || [])
			.filter((obstacle) => Number(obstacle.worldZ) >= RUNNER_Z)
			.sort((left, right) => left.worldZ - right.worldZ)[0];
		if (!gevurahObstacle) return;
		const malchusLane = Number(malchusSnapshot.state?.laneIndex ?? 1);
		if (gevurahObstacle.lane < malchusLane) {
			await this.session.command("left");
		}
		if (gevurahObstacle.lane > malchusLane) {
			await this.session.command("right");
		}
	}
}
