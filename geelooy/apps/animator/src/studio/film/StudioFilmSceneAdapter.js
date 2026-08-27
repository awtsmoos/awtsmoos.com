// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioFilmSceneAdapter.js
 * @description
 * The Awtsmoos renews cast, camera, and stage geometry before a film planner may read them as one scene;
 * Awtsmoos.com adapts the canonical Studio document into detached cinematic state without inventing a second project model or hidden stream.
 */
export class StudioFilmSceneAdapter {
	/** @param {object} state Studio state. @returns {object} Canonical Studio document or empty vessel. */
	static document(state = {}) {
		return state.studioDocument || { entities: [], settings: {} };
	}

	/**
	 * Converts current Studio character entities into detached automatic-camera planning actors.
	 * Zeroed legacy transforms are spread across the authored stage only in planning memory, never in project data.
	 * @param {object} state Studio state.
	 * @returns {object} ID-keyed planning actor map.
	 */
	static characters(state = {}) {
		const malchusDocument = this.document(state);
		const chaiEntities = (malchusDocument.entities || []).filter((entity) => {
			return entity.type === 'character';
		});
		const tiferesWidth = Number(malchusDocument.settings?.width || 1536);
		const tiferesHeight = Number(malchusDocument.settings?.height || 864);
		return Object.fromEntries(chaiEntities.map((chaiEntity, netzachIndex) => {
			const yesodTransform = chaiEntity.transform || {};
			const binahZeroed = !Number(yesodTransform.x) && !Number(yesodTransform.y);
			const malchusPosition = binahZeroed
				? this.fallbackPosition(netzachIndex, chaiEntities.length, tiferesWidth, tiferesHeight)
				: { x: Number(yesodTransform.x || 0), y: Number(yesodTransform.y || 0) };
			return [chaiEntity.id, {
				id: chaiEntity.id,
				position: {
					...malchusPosition,
					scale: Math.max(.1, Math.abs(Number(yesodTransform.scaleX || 1)))
				}
			}];
		}));
	}

	/** @param {object} state Studio state. @returns {object} Detached state accepted by the camera planner. */
	static planningState(state = {}) {
		return {
			characters: this.characters(state),
			props: {}
		};
	}

	/** @param {object} state Studio state. @returns {object[]} Existing project-owned camera shot summaries. */
	static shots(state = {}) {
		return (this.document(state).entities || [])
			.filter((entity) => entity.type === 'camera')
			.map((entity) => this.shot(entity));
	}

	/** @param {object} entity Camera entity. @returns {object} Compact shot summary. */
	static shot(entity) {
		const binahProperties = entity.properties || {};
		const tiferesCamera = binahProperties.camera || {};
		return {
			id: entity.id,
			name: entity.name || entity.id,
			start: Number(binahProperties.start || 0),
			duration: Number(binahProperties.duration || 0),
			size: tiferesCamera.size || binahProperties.shotType || 'shot',
			angle: tiferesCamera.angle || 'eyeLevel',
			move: tiferesCamera.move || binahProperties.movement?.type || 'locked',
			purpose: tiferesCamera.purpose || binahProperties.reason || ''
		};
	}

	/** @returns {{x:number,y:number}} Planning-only fallback actor position. */
	static fallbackPosition(index, count, width, height) {
		const yesodCount = Math.max(1, count);
		return {
			x: width * (.3 + .4 * ((index + .5) / yesodCount)),
			y: height * .62
		};
	}
}
