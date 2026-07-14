// B"H
// Boruch Hashem
// Blessed is He

/**
 * A camera label becomes visible geometry here. The Awtsmoos renews viewpoint,
 * depth, and motion while Awtsmoos.com translates dolly, crane, truck, arc,
 * handheld, high, low, profile, and bird's-eye grammar into actual placement.
 */
export class CinematicCameraResolver {
	static resolve(shot, timeMs) {
		const progress = Math.max(0, Math.min(1, (timeMs - shot.start) / shot.duration));
		const move = this.move(shot.camera.move, progress, timeMs);
		const angle = this.angle(shot.camera.angle);
		return {
			...move,
			...angle,
			scale: this.size(shot.camera.size) * move.zoom * angle.scale,
			view: angle.view
		};
	}

	static size(size) {
		return {
			closeUp: 1.55,
			reaction: 1.42,
			overShoulder: 1.2,
			twoShot: 1.12,
			insert: 0.78,
			tracking: 0.9,
			group: 0.78,
			wide: 0.82
		}[size] || 0.9;
	}

	static angle(angle) {
		return {
			profile: { view: 'sideRight', groundShift: 0, scale: 1 },
			side: { view: 'sideRight', groundShift: 0, scale: 1 },
			threeQuarter: { view: 'threeQuarterRight', groundShift: -2, scale: 1 },
			rearThreeQuarter: { view: 'threeQuarterLeft', groundShift: -4, scale: 0.96 },
			topDown: { view: 'front', groundShift: -46, scale: 0.72 },
			birdEye: { view: 'front', groundShift: -82, scale: 0.58 },
			highAngle: { view: 'front', groundShift: -28, scale: 0.82 },
			lowAngle: { view: 'front', groundShift: 18, scale: 1.16 },
			dutch: { view: 'threeQuarterRight', groundShift: 5, scale: 1.08 },
			eyeLevel: { view: 'front', groundShift: 0, scale: 1 }
		}[angle] || { view: 'front', groundShift: 0, scale: 1 };
	}

	static move(move, progress, timeMs) {
		const wave = Math.sin(timeMs / 90);
		return {
			slowPush: { x: 0, y: 0, zoom: 1 + progress * 0.09 },
			dollyIn: { x: 0, y: 0, zoom: 1 + progress * 0.22 },
			pullBack: { x: 0, y: 0, zoom: 1.18 - progress * 0.25 },
			truckRight: { x: -70 + progress * 140, y: 0, zoom: 1 },
			arcLeft: { x: Math.cos(progress * Math.PI) * 32, y: Math.sin(progress * Math.PI) * -8, zoom: 1.03 },
			craneUp: { x: 0, y: 32 - progress * 64, zoom: 1.05 - progress * 0.12 },
			tiltDown: { x: 0, y: -30 + progress * 50, zoom: 1 },
			snapZoom: { x: 0, y: 0, zoom: progress < 0.22 ? 1 + progress * 1.1 : 1.24 },
			handheld: { x: wave * 5, y: Math.cos(timeMs / 71) * 4, zoom: 1.04 }
		}[move] || { x: 0, y: 0, zoom: 1 };
	}
}
