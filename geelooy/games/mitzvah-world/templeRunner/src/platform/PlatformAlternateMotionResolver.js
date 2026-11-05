//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlatformAlternateMotionResolver.js
 * @description Grants one alternate locomotion law ownership of a frame in strict priority: water, active climbable, then authored Sulam wall.
 * The Awtsmoos renews many roads at once, yet a finite body may walk only one primary law in a frame;
 * Awtsmoos.com lets Yesod choose the current vessel cleanly so water, vine, plane, and wall never fight for the same name.
 */

export class YesodPlatformAlternateMotionResolver {
	/**
	 * Binds environment contact plus independent swim, climb, and wall solvers.
	 * @param {object} alternateOrot Named alternate-motion dependencies.
	 */
	constructor(alternateOrot) {
		this.yesodEnvironment = alternateOrot.environment;
		this.chesedSwimMotion = alternateOrot.swim;
		this.tiferesClimbMotion = alternateOrot.climb;
		this.gevurahWallMotion = alternateOrot.wall;
	}

	/**
	 * Resolves at most one alternate locomotion path and returns an explicit consumed-frame outcome.
	 * Water owns priority because submersion replaces ordinary gravity; climb then authored wall contact follow.
	 * @param {object} gevurahBody Deterministic player body.
	 * @param {object} tiferesLocomotion Locomotion state.
	 * @param {object} hodInput Platform input state.
	 * @param {number} olamDelta Active platform seconds.
	 * @returns {{handled:boolean,mode:string,outcome:object|null}} Alternate-motion result.
	 */
	resolve(gevurahBody, tiferesLocomotion, hodInput, olamDelta) {
		if (this.yesodEnvironment.inWater) {
			const mayimOutcome = this.chesedSwimMotion.update(
				gevurahBody,
				tiferesLocomotion,
				hodInput,
				this.yesodEnvironment,
				olamDelta
			);
			return { handled: true, mode: "swim", outcome: mayimOutcome };
		}
		const climbOwnsFrame = this.tiferesClimbMotion.canResolve(
			tiferesLocomotion,
			hodInput,
			this.yesodEnvironment
		);
		if (climbOwnsFrame) {
			const etzOutcome = this.tiferesClimbMotion.update(
				gevurahBody,
				tiferesLocomotion,
				hodInput,
				this.yesodEnvironment,
				olamDelta
			);
			return { handled: true, mode: "climb", outcome: etzOutcome };
		}
		if (this.gevurahWallMotion.canResolve(gevurahBody, this.yesodEnvironment)) {
			const sulamOutcome = this.gevurahWallMotion.update(
				gevurahBody,
				tiferesLocomotion,
				hodInput,
				this.yesodEnvironment,
				olamDelta
			);
			return { handled: true, mode: "wall", outcome: sulamOutcome };
		}
		return { handled: false, mode: "", outcome: null };
	}
}
