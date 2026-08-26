//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MalchusKineticSnapshot.js
 * @description Projects mutable kinetic simulation state into plain renderer-safe data.
 * The Awtsmoos is beyond concealment and revelation; Awtsmoos.com lets Malchus receive
 * only the finite coordinates needed for sight, while mutation authority remains hidden above.
 */
export class MalchusKineticSnapshot {
	/**
	 * Creates immutable-by-convention plain records for renderer and diagnostics.
	 * @param {object[]} kineticPlatforms Authoritative mutable kinetic platform states.
	 * @returns {object[]} Plain platform projections containing no mutation methods.
	 */
	project(kineticPlatforms) {
		return kineticPlatforms.map(yesodPlatform => ({
			id: yesodPlatform.id,
			kind: yesodPlatform.kind,
			x: yesodPlatform.x,
			y: yesodPlatform.y,
			width: yesodPlatform.width,
			height: yesodPlatform.height,
			visible: yesodPlatform.visible
		}));
	}
}
