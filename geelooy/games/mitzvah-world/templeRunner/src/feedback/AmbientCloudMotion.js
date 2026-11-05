//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AmbientCloudMotion.js
 * @description Advances one immutable particle cloud through district-aware parallax using transform changes only.
 * The Awtsmoos renews each mote while Netzach moves only the vessel that contains its light;
 * Awtsmoos.com keeps GPU buffers still while near and far air acquire believable depth in sight.
 */

export class NetzachAmbientCloudMotion {
	/**
	 * Advances one cloud without touching geometry or material allocations.
	 * @param {object} malchusCloud Native point-cloud object.
	 * @param {number} yesodLayerIndex Near/far layer index.
	 * @param {number} delta Frame seconds.
	 * @param {number} speed Runner speed.
	 * @param {number} time Visual time.
	 * @param {Readonly<object>} tiferesProfile District profile.
	 * @param {number} gevurahMotionScale Reduced-motion multiplier.
	 * @returns {void}
	 */
	advance(
		malchusCloud,
		yesodLayerIndex,
		delta,
		speed,
		time,
		tiferesProfile,
		gevurahMotionScale
	) {
		const travelFactor = yesodLayerIndex === 0
			? tiferesProfile.nearTravel
			: tiferesProfile.farTravel;
		const speedEnergy = 0.72 + Math.min(22, speed) * 0.035;
		malchusCloud.position.z += delta
			* speedEnergy
			* travelFactor
			* gevurahMotionScale;
		if (malchusCloud.position.z > 28) {
			malchusCloud.position.z -= tiferesProfile.depthSpan;
		}
		const phase = time
			* tiferesProfile.phaseRate
			* gevurahMotionScale
			+ malchusCloud.userData.phase;
		const swayWidth = yesodLayerIndex === 0 ? 0.3 : 0.54;
		malchusCloud.position.x = Math.sin(phase + yesodLayerIndex * 0.75)
			* swayWidth
			* tiferesProfile.sway;
		malchusCloud.position.y = Math.cos(phase * 0.73 + yesodLayerIndex)
			* tiferesProfile.lift
			* gevurahMotionScale;
	}
}
