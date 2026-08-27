// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorEventStateProjector.js
 * @description
 * The Awtsmoos lets a vast editor state become a tiny reference-and-scalar comparison surface instead of re-hashing the whole world each frame;
 * Awtsmoos.com keeps playhead events constant-time while durable project change is detected from immutable-by-convention reference renewal flame.
 */

/** Projects store state into bounded comparison values and derives meaningful store-backed event payloads. */
export class BinahAnimatorEventStateProjector {
	/**
	 * Captures cheap scalar and object-reference evidence from the canonical NLE store.
	 * @param {object} keliState Current NLE state.
	 * @returns {object} Bounded comparison snapshot.
	 */
	static snapshot(keliState = {}) {
		return {
			selectedEntityId: keliState.selectedEntityId ?? null,
			selectedClipId: keliState.selectedClipId ?? null,
			playhead: Number(keliState.playhead) || 0,
			playing: Boolean(keliState.playing),
			studioDocument: keliState.studioDocument ?? null,
			mediaAssets: keliState.mediaAssets ?? null,
			clips: keliState.clips ?? null,
			tracks: keliState.tracks ?? null,
			keyframes: keliState.keyframes ?? null
		};
	}

	/**
	 * Compares two bounded projections without traversing entire project graphs.
	 * @param {object|null} keliBefore Prior projection.
	 * @param {object} keliAfter New projection.
	 * @returns {object[]} Event emissions.
	 */
	static diff(keliBefore, keliAfter) {
		if (!keliBefore) {
			return [];
		}
		const sederEvents = [];
		this.pushSelection(sederEvents, keliBefore, keliAfter);
		this.pushScalar(
			sederEvents,
			'timeline.playheadChanged',
			'playhead',
			keliBefore,
			keliAfter
		);
		this.pushScalar(
			sederEvents,
			'playback.changed',
			'playing',
			keliBefore,
			keliAfter
		);
		if (keliBefore.studioDocument !== keliAfter.studioDocument) {
			sederEvents.push({
				name: 'document.changed',
				payload: { changed: true }
			});
		}
		if (this.projectChanged(keliBefore, keliAfter)) {
			sederEvents.push({
				name: 'project.changed',
				payload: { changed: true }
			});
		}
		return sederEvents;
	}

	/** @param {object} before Prior projection. @param {object} after Next projection. @returns {boolean} Durable project reference changed. */
	static projectChanged(before, after) {
		return before.studioDocument !== after.studioDocument
			|| before.mediaAssets !== after.mediaAssets
			|| before.clips !== after.clips
			|| before.tracks !== after.tracks
			|| before.keyframes !== after.keyframes;
	}

	/** @param {object[]} out Events. @param {object} before Prior. @param {object} after Next. */
	static pushSelection(out, before, after) {
		if (
			before.selectedEntityId === after.selectedEntityId
			&& before.selectedClipId === after.selectedClipId
		) {
			return;
		}
		out.push({
			name: 'selection.changed',
			payload: {
				selectedEntityId: after.selectedEntityId,
				selectedClipId: after.selectedClipId
			}
		});
	}

	/** @param {object[]} out Events. @param {string} name Event name. @param {string} key Projection key. @param {object} before Prior. @param {object} after Next. */
	static pushScalar(out, name, key, before, after) {
		if (Object.is(before[key], after[key])) {
			return;
		}
		out.push({
			name,
			payload: {
				previous: before[key],
				current: after[key]
			}
		});
	}
}
