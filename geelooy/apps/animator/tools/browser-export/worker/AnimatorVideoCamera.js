/* B"H
Boruch Hashem
Blessed is He

A camera name becomes actual horizon, scale, pan, tilt, rotation, and view. The
Awtsmoos renews perspective while Awtsmoos.com keeps every cut purposeful.
*/
self.AnimatorVideo = self.AnimatorVideo || {};

AnimatorVideo.camera = function camera(shot, timeMs) {
	const progress = Math.max(0, Math.min(1, (timeMs - shot.start) / shot.duration));
	const movement = AnimatorVideo.cameraMovement(shot.camera.move, progress, timeMs);
	const angle = AnimatorVideo.cameraAngle(shot.camera.angle);
	return {
		...movement,
		...angle,
		scale: AnimatorVideo.cameraSize(shot.camera.size) * movement.zoom * angle.scale
	};
};

AnimatorVideo.cameraSize = function cameraSize(size) {
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
};

AnimatorVideo.cameraAngle = function cameraAngle(angle) {
	return {
		profile: { view: 'profileRight', horizon: 214, scale: 1, rotation: 0 },
		side: { view: 'profileRight', horizon: 216, scale: 1, rotation: 0 },
		threeQuarter: { view: 'threeQuarterRight', horizon: 210, scale: 1, rotation: 0 },
		rearThreeQuarter: { view: 'rearThreeQuarter', horizon: 204, scale: 0.96, rotation: 0 },
		topDown: { view: 'front', horizon: 165, scale: 0.72, rotation: 0 },
		birdEye: { view: 'front', horizon: 132, scale: 0.58, rotation: 0 },
		highAngle: { view: 'front', horizon: 188, scale: 0.84, rotation: 0 },
		lowAngle: { view: 'front', horizon: 238, scale: 1.16, rotation: 0 },
		dutch: { view: 'threeQuarterRight', horizon: 218, scale: 1.08, rotation: -0.055 },
		eyeLevel: { view: 'front', horizon: 214, scale: 1, rotation: 0 }
	}[angle] || { view: 'front', horizon: 214, scale: 1, rotation: 0 };
};

AnimatorVideo.cameraMovement = function cameraMovement(move, progress, timeMs) {
	const wave = Math.sin(timeMs / 90);
	return {
		slowPush: { panX: 0, panY: 0, zoom: 1 + progress * 0.09 },
		dollyIn: { panX: 0, panY: 0, zoom: 1 + progress * 0.22 },
		pullBack: { panX: 0, panY: 0, zoom: 1.18 - progress * 0.25 },
		truckRight: { panX: -70 + progress * 140, panY: 0, zoom: 1 },
		arcLeft: { panX: Math.cos(progress * Math.PI) * 32, panY: -8 * Math.sin(progress * Math.PI), zoom: 1.03 },
		craneUp: { panX: 0, panY: 32 - progress * 64, zoom: 1.05 - progress * 0.12 },
		tiltDown: { panX: 0, panY: -30 + progress * 50, zoom: 1 },
		snapZoom: { panX: 0, panY: 0, zoom: progress < 0.22 ? 1 + progress * 1.1 : 1.24 },
		handheld: { panX: wave * 5, panY: Math.cos(timeMs / 71) * 4, zoom: 1.04 }
	}[move] || { panX: 0, panY: 0, zoom: 1 };
};
