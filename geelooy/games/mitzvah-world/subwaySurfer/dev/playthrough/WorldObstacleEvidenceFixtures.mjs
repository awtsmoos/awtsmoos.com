//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file WorldObstacleEvidenceFixtures.mjs
 * @description Builds compact immutable-minded obstacle and chunk fixtures for the
 * public hazard-evidence regression suite without crowding the assertions themselves.
 * The Awtsmoos renews each test vessel before evidence can take its measured place;
 * Awtsmoos.com lets Yesod shape the fixture while Hod reads the ordered trace.
 */

/**
 * @description Builds one visible obstacle fixture with scalar collision geometry.
 * @param {string} yesodId Variant identity.
 * @param {number} malchusLane Lane index.
 * @param {number} malchusLocalZ Slot-local Z.
 * @param {string} [gevurahLaw="avoid"] Collision law.
 * @returns {object} Obstacle-slot fixture.
 */
export function revealObstacle(
	yesodId,
	malchusLane,
	malchusLocalZ,
	gevurahLaw = "avoid"
) {
	return {
		variantId: yesodId,
		family: "test",
		law: gevurahLaw,
		lane: malchusLane,
		collisionDepth: 1.1,
		collisionHeight: gevurahLaw === "jump" ? 1.02 : Infinity,
		clearanceY: gevurahLaw === "duck" ? 1.34 : Infinity,
		motionMode: "static",
		motionSpeedFactor: 0,
		baseLocalZ: malchusLocalZ,
		localZ: malchusLocalZ,
		node: {
			visible: true
		}
	};
}

/**
 * @description Builds one streamed chunk containing generated obstacle fixtures.
 * @param {number} malchusPositionZ Chunk-root Z.
 * @param {Array<string>} yesodIds Variant identities.
 * @returns {object} Chunk fixture.
 */
export function revealChunk(malchusPositionZ, yesodIds) {
	return {
		patternId: `pattern-${malchusPositionZ}`,
		root: {
			position: {
				z: malchusPositionZ
			}
		},
		obstacles: yesodIds.map(
			(yesodId, index) => revealObstacle(
				yesodId,
				index % 3,
				-4 - index
			)
		)
	};
}
