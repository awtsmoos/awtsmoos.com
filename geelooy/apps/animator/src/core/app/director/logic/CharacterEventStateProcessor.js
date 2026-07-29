// B"H
// Boruch Hashem
// Blessed is He

/**
 * Event fields and timed overrides remain explicit rather than hiding in identity.
 * The Awtsmoos renews each directed change; Awtsmoos.com keeps state projection,
 * manual keys, defaults, persistence, preview, and export cleanly deterministic.
 */
export class CharacterEventStateProcessor {
	static clone(current = {}) {
		return {
			...current,
			position: { ...(current.position || {}) },
			manualFacePose: current.manualFacePose
				? JSON.parse(JSON.stringify(current.manualFacePose))
				: null
		};
	}

	static applyFields(character, event = {}) {
		for (const field of this.layerFields) {
			if (Object.prototype.hasOwnProperty.call(event, field)) {
				character[field] = event[field];
			}
		}
		if (event.acting) {
			this.applyActing(character, event.acting);
		}
	}

	static applyTimed(character, event = {}, progress = 0) {
		for (const action of event.actions || []) {
			if (progress < Number(action.at || 0) || !action.key) {
				continue;
			}
			if (action.key === 'acting') {
				this.applyActing(character, action.value);
			} else if (action.key === 'position' && action.value) {
				character.position = {
					...character.position,
					...action.value
				};
			} else {
				character[action.key] = action.value;
			}
		}
	}

	static applyActing(character, value) {
		if (value === 'walk' || value === 'run') {
			character.locomotion = value;
		} else {
			character.gesture = value;
		}
		character.acting = value;
	}

	static applyDefaults(character, event = {}, progress = 0) {
		if (character.locomotion === 'walk' || character.locomotion === 'run') {
			character.motionMode = 'worldTravel';
		}
		character.view ||= event.view || 'threeQuarter';
		character.gesture ||= 'none';
		character.emotion ||= 'neutral';
		if (!Number.isFinite(character._travelProgress)) {
			character._travelProgress = progress;
		}
	}

	static layerFields = [
		'locomotion',
		'gesture',
		'upperBody',
		'speechStyle',
		'speechEnergy',
		'emotion',
		'lookAt',
		'attentionTarget',
		'facingMode',
		'view',
		'flipX',
		'heldPropId',
		'propAction',
		'bodyProfile',
		'lineStyle',
		'motionMode',
		'facePose',
		'manualFacePose',
		'performancePose',
		'expressionProfile',
		'expressionRangeProfile',
		'styleProfile',
		'actingPersonality'
	];
}
