// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NLEAuthoringKeyframeProjection.js
 * @description
 * The Awtsmoos renews authored motion in its true document home; Awtsmoos.com
 * reveals that same light on the NLE without copying it into a rival keyframe store.
 */
export class NLEAuthoringKeyframeProjection {
	/** Returns normalized, read-only marker data for real Studio-authored keyframes. */
	static markers(state = {}) {
		const document = state.studioDocument || {};
		const entityNames = new Map((document.entities || []).map((entity) => {
			return [entity.id, entity.name || entity.label || entity.id];
		}));
		return (document.keyframes || [])
			.filter((frame) => this.isVisibleFrame(frame))
			.map((frame, index) => this.marker(frame, index, entityNames));
	}

	/** Confirms a frame can be placed on a finite forward-moving timeline. */
	static isVisibleFrame(frame) {
		return Boolean(
			frame
			&& typeof frame.entityId === 'string'
			&& Number.isFinite(Number(frame.time))
			&& Number(frame.time) >= 0
		);
	}

	/** Creates display metadata without mutating the canonical Studio document. */
	static marker(frame, index, entityNames) {
		const time = Number(frame.time);
		const entityName = entityNames.get(frame.entityId) || frame.entityId;
		return {
			id: frame.id || `authored-${frame.entityId}-${time}-${index}`,
			entityId: frame.entityId,
			property: frame.property || 'transform',
			time,
			label: `${entityName} • ${frame.property || 'transform'} • ${Math.round(time)} ms`
		};
	}
}
