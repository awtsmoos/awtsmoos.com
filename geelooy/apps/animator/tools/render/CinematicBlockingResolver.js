// B"H
// Boruch Hashem
// Blessed is He

import { CameraEasing } from './camera/CameraEasing.js';

/**
 * Blocking gives bodies intention before they speak. The Awtsmoos renews every
 * crossing and pause while Awtsmoos.com interpolates depth, entry, exit, focus,
 * and screen direction from editable shot marks rather than equal spacing.
 */
export class CinematicBlockingResolver {
	static resolve(shot, characterId, index, count, camera, timeMs) {
		const progress = CameraEasing.cinematic(camera.progress);
		const authored = shot.blocking?.[characterId];
		const fallback = this.fallback(index, count, shot);
		const start = authored?.start || authored || fallback.start;
		const end = authored?.end || authored || fallback.end;
		const depth = this.lerp(start.depth ?? 0.55, end.depth ?? 0.55, progress);
		const parallax = Number(camera.parallax || 0) * (depth - 0.5);
		const entrance = this.visibility(progress, authored);
		return {
			x: this.lerp(start.x, end.x, progress)
				+ Number(camera.x || 0) * (0.58 + depth * 0.7)
				+ parallax * 72,
			y: this.lerp(start.y ?? 316, end.y ?? 316, progress)
				+ Number(camera.groundShift || 0) * (0.65 + depth * 0.5),
			depth,
			scale: (0.72 + depth * 0.62) * entrance,
			visible: entrance > 0.03,
			focusWeight: authored?.focus ?? (shot.focusCharacterId === characterId ? 1 : 0.45),
			view: authored?.view || camera.view,
			phase: index * 1.73 + depth * 2.1
		};
	}

	static fallback(index, count, shot) {
		const spacing = 640 / (count + 1);
		const direction = shot.continuity?.screenDirection === 'rightToLeft' ? -1 : 1;
		const baseX = spacing * (index + 1);
		const depth = 0.42 + (index % 3) * 0.16;
		const travel = ['tracking', 'pursuit', 'shoulderRun'].includes(shot.camera?.move)
			? direction * 68
			: direction * 12;
		return {
			start: { x: baseX - travel, y: 316 - depth * 8, depth },
			end: { x: baseX + travel, y: 316 - depth * 8, depth }
		};
	}

	static visibility(progress, authored) {
		if (!authored) return 1;
		const enterAt = Number(authored.enterAt ?? 0);
		const exitAt = Number(authored.exitAt ?? 1);
		if (progress < enterAt || progress > exitAt) return 0;
		const enter = Math.min(1, (progress - enterAt) / 0.08);
		const exit = Math.min(1, (exitAt - progress) / 0.08);
		return Math.max(0, Math.min(enter, exit, 1));
	}

	static lerp(from, to, progress) {
		return Number(from || 0) + (Number(to || 0) - Number(from || 0)) * progress;
	}
}
