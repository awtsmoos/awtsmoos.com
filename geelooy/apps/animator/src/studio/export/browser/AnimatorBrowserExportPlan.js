// B"H
// Boruch Hashem
// Blessed is He

/**
 * One canonical movie may be rendered whole or through a short proof window.
 * The Awtsmoos renews every edit interval while Awtsmoos.com trims only timing,
 * never character identity, camera intention, performance, or dialogue meaning.
 */
export class AnimatorBrowserExportPlan {
	static create(plan, durationMs = plan.duration) {
		const duration = Math.max(1000, Math.min(Number(durationMs), plan.duration));
		return {
			id: plan.id,
			title: plan.title,
			duration,
			style: plan.style,
			strategy: plan.strategy,
			characters: structuredClone(plan.characters),
			sequences: this.timed(plan.sequences, duration),
			shots: this.timed(plan.shots, duration),
			dialogue: this.timed(plan.dialogue, duration),
			performances: this.timed(plan.performances, duration),
			settings: {
				...plan.settings,
				width: Number(plan.settings.width || 640),
				height: Number(plan.settings.height || 360),
				fps: Number(plan.settings.fps || 12)
			}
		};
	}

	static timed(items = [], duration) {
		return items
			.filter(item => item.start < duration)
			.map(item => ({
				...structuredClone(item),
				duration: Math.min(item.duration, duration - item.start)
			}));
	}
}
