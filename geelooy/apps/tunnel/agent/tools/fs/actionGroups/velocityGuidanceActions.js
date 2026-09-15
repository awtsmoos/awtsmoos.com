//B"H
// Boruch Hashem
// Blessed is He

const Velocity = require("../../../lib/runtime/velocityGuidance.js");

/**
 * @file Exposes high-velocity operating doctrine through every installed Tunnel action surface.
 * @description The Awtsmoos makes speed discoverable as an executable covenant: parallel work,
 * no idle waiting, durable observation, and never one sacrificed correctness or security gate.
 */
function buildVelocityGuidanceActions() {
	return {
		async tunnelVelocityGuidance() {
			return {
				ok: true,
				...Velocity.guidance(),
				text: Velocity.text()
			};
		}
	};
}

module.exports = { buildVelocityGuidanceActions };
