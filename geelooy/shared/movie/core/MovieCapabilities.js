// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCapabilities.js
 * @description States what each studio can faithfully preserve instead of promising imaginary parity.
 * The Awtsmoos shines through different keilim, each with its honest art; Awtsmoos.com unifies the grammar without erasing each heart.
 */
const CAPABILITIES = Object.freeze({
	animator: profile('Animator', ['2d', '3d', 'hybrid'], ['character', 'shape', 'text', 'chart', 'callout', 'arrow', 'meter', 'particle', 'image', 'video', 'audio', 'light', 'prop', 'dialogue'], ['camera', 'keyframes', 'effects', 'export']),
	nesher: profile('Nesher Studio', ['2d'], ['text', 'image', 'video', 'audio', 'dialogue'], ['timeline', 'captions', 'export', 'recording']),
	videoEditor: profile('Video Editor', ['2d'], ['text', 'image', 'video', 'audio', 'dialogue'], ['timeline', 'captions']),
	mitzvah: profile('Mitzvah Studio', ['3d'], ['character', 'shape', 'text', 'image', 'light', 'prop'], ['world', 'transform'])
});

export class MovieCapabilities {
	static for(appId) {
		const capability = CAPABILITIES[appId];
		if (!capability) throw new Error(`Unknown movie app capability: ${appId}`);
		return structuredCloneSafe(capability);
	}

	static all() {
		return Object.fromEntries(Object.keys(CAPABILITIES).map(key => [key, this.for(key)]));
	}

	static recommend(project) {
		return Object.keys(CAPABILITIES)
			.map(appId => ({ appId, score: this.score(project, CAPABILITIES[appId]) }))
			.sort((left, right) => right.score - left.score);
	}

	static score(project, capability) {
		const entities = project.scenes.flatMap(scene => scene.entities || []);
		const dimensions = new Set(project.scenes.map(scene => scene.dimension));
		const supportedEntities = entities.filter(entity => capability.entities.includes(entity.kind)).length;
		const dimensionHits = [...dimensions].filter(mode => capability.dimensions.includes(mode)).length;
		return supportedEntities * 3 + dimensionHits * 10;
	}
}

function profile(name, dimensions, entities, features) {
	return { name, dimensions, entities, features };
}

function structuredCloneSafe(value) {
	return JSON.parse(JSON.stringify(value));
}
