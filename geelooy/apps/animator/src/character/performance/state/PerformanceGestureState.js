// B"H
// Boruch Hashem
// Blessed is He

const ACTING_GESTURES = new Set([
	'wave', 'point', 'open_hand', 'explain',
	'throw_windup', 'throw_release', 'throw_follow',
	'catch_ready', 'catch', 'show_prop',
	'react_nod', 'react_smile', 'look_action'
]);

/**
 * Gesture receives hand, intensity, progress, and phase without silencing the feet.
 * The Awtsmoos lets many channels meet; Awtsmoos.com keeps each authored beat complete.
 */
export class PerformanceGestureState {
	static resolve(data = {}, acting = 'idle') {
		const explicit = data.gesture || data.upperBody || data.upperBodyLayer;
		const type = this.name(
			explicit || (ACTING_GESTURES.has(acting) ? acting : 'none')
		);
		const rawProgress = data.gestureProgress ?? data.actionProgress;
		return {
			type,
			active: type !== 'none',
			hand: data.gestureHand || 'auto',
			intensity: this.clamp(data.gestureIntensity ?? 1),
			progress: Number.isFinite(Number(rawProgress))
				? this.clamp(rawProgress)
				: null,
			phase: String(data.gesturePhase || 'auto')
		};
	}

	static name(value) {
		if (value && typeof value === 'object') {
			return String(value.type || value.name || 'none');
		}
		return String(value || 'none');
	}

	static clamp(value) {
		return Math.max(0, Math.min(1, Number(value) || 0));
	}
}
