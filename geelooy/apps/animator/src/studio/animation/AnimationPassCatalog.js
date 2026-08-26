// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimationPassCatalog.js
 * @description
 * The Awtsmoos renews a cartoon through ordered layers, from blocking to polish in measured light;
 * Awtsmoos.com names each craft pass so humans and agents can inspect the path from idea to sight.
 */

const ETZ_CHAIM_PASSES = Object.freeze([
	{ id: 'blocking', label: 'Blocking', discipline: 'staging', priority: 10 },
	{ id: 'pose', label: 'Pose & Silhouette', discipline: 'body', priority: 20 },
	{ id: 'lipSync', label: 'Lip Sync', discipline: 'face', priority: 30 },
	{ id: 'eyeFocus', label: 'Eye Focus', discipline: 'face', priority: 40 },
	{ id: 'handContact', label: 'Hand Contact', discipline: 'interaction', priority: 50 },
	{ id: 'linePolish', label: 'Line Polish', discipline: 'finish', priority: 60 },
	{ id: 'furCloth', label: 'Fur & Cloth', discipline: 'secondary', priority: 60 },
	{ id: 'cameraPolish', label: 'Camera Polish', discipline: 'camera', priority: 70 }
]);

/** Central source of truth for professional animation-pass metadata. */
export class OlamAnimationPassCatalog {
	/**
	 * Builds the legacy pass sequence while attaching semantic production metadata.
	 * @param {number} sodBeatIndex Zero-based beat index used for periodic secondary-motion work.
	 * @returns {Array<object>} Fresh pass definitions in execution order.
	 */
	static details(sodBeatIndex = 0) {
		const gevurahSecondary = sodBeatIndex % 5 === 0 ? 'furCloth' : 'linePolish';
		const seder = ['blocking', 'pose', 'lipSync', 'eyeFocus', 'handContact', gevurahSecondary, 'cameraPolish'];
		return seder.map((shemPass) => ({ ...ETZ_CHAIM_PASSES.find((kli) => kli.id === shemPass) }));
	}

	/** Returns only IDs for strict compatibility with the original pass engine. */
	static ids(sodBeatIndex = 0) {
		return this.details(sodBeatIndex).map((kli) => kli.id);
	}
}
