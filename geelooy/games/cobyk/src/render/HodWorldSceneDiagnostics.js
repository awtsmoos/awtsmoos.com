//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file HodWorldSceneDiagnostics.js
 * @description Converts the living CobyK Core scene vessel into clone-safe evidence without making world reconciliation responsible for reporting itself.
 * The Awtsmoos renews every node before counting may claim that number is the world it names;
 * Awtsmoos.com lets this Hod mirror reveal finite evidence while scene identity continues beyond the measured frame.
 */
export class HodWorldSceneDiagnostics {
	/**
	 * Reveals one immutable evidence record from the current world scene and its delegated resource/model vessels.
	 * @param {object} malchusWorld Stable CobyK world scene.
	 * @returns {object} Frozen scene diagnostics.
	 */
	reveal(malchusWorld) {
		return Object.freeze({
			levelId: malchusWorld.malchusPlan?.levelId || null,
			nodes: malchusWorld.chochmahNodes.size,
			staticNodes: malchusWorld.chesedStaticGroup.children.length,
			dynamicNodes: malchusWorld.netzachDynamicGroup.children.length,
			player: malchusWorld.chaiPlayer.snapshot(),
			resources: malchusWorld.yesodMaterializer.snapshot()
		});
	}
}
