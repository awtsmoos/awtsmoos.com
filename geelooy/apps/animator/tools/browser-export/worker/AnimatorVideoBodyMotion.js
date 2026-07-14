/* B"H
Boruch Hashem
Blessed is He

Posture, emotion, locomotion, and gesture become a coordinated body performance.
The Awtsmoos renews every joint while Awtsmoos.com keeps motion modular.
*/
self.AnimatorVideo = self.AnimatorVideo || {};

AnimatorVideo.bodyJoints = function bodyJoints(
	x,
	ground,
	anatomy,
	timeMs,
	performance,
	phase
) {
	const action = performance.action || 'idle';
	const motion = ['walk', 'run', 'dance'].includes(action)
		? action === 'run' ? 1.45 : 1
		: 0.08;
	const stride = Math.sin(timeMs / 145 + phase)
		* 18 * anatomy.scale * motion;
	const bob = Math.abs(Math.sin(timeMs / 145 + phase))
		* 5 * anatomy.scale * motion;
	const posture = AnimatorVideo.posture(performance);
	const emotion = AnimatorVideo.emotionBody(performance.emotion);
	const pelvisY = ground - anatomy.legHeight
		+ bob + posture.drop * anatomy.scale;
	const chestY = pelvisY - anatomy.torsoHeight * 0.72;
	const chestX = x + (posture.lean + emotion.lean) * anatomy.scale;
	const handLift = AnimatorVideo.gestureLift(
		performance.gesture,
		anatomy.scale
	);
	return {
		pelvis: { x, y: pelvisY },
		chest: { x: chestX, y: chestY + emotion.drop * anatomy.scale },
		neck: {
			x: chestX + emotion.head * anatomy.scale,
			y: chestY - anatomy.torsoHeight * 0.42
		},
		leftFoot: { x: x - anatomy.hip * 0.22 + stride, y: ground },
		rightFoot: { x: x + anatomy.hip * 0.22 - stride, y: ground },
		leftHand: {
			x: chestX - anatomy.shoulder * 0.72 - stride * 0.5,
			y: chestY + anatomy.torsoHeight * 0.58
		},
		rightHand: {
			x: chestX + anatomy.shoulder * 0.72 + stride * 0.5 + handLift.x,
			y: chestY + anatomy.torsoHeight * 0.58 + handLift.y
		},
		bob,
		shoulderDrop: posture.shoulder + emotion.shoulder
	};
};

AnimatorVideo.posture = function posture(performance) {
	return {
		upright: { lean: 0, drop: 0, shoulder: 0 },
		relaxed: { lean: 4, drop: 3, shoulder: 3 },
		grounded: { lean: -2, drop: 2, shoulder: 1 },
		assertive: { lean: -3, drop: -2, shoulder: -2 },
		shy: { lean: 6, drop: 5, shoulder: 4 }
	}[performance.posture] || { lean: 0, drop: 0, shoulder: 0 };
};

AnimatorVideo.emotionBody = function emotionBody(emotion) {
	return {
		happy: { lean: -1, drop: -1, head: 0, shoulder: -1 },
		sad: { lean: 4, drop: 3, head: 3, shoulder: 4 },
		angry: { lean: -4, drop: -2, head: -2, shoulder: -2 },
		afraid: { lean: 3, drop: -2, head: 3, shoulder: -3 },
		surprised: { lean: -1, drop: -3, head: 0, shoulder: -4 },
		laughing: { lean: -2, drop: 1, head: -2, shoulder: 1 }
	}[emotion] || { lean: 0, drop: 0, head: 0, shoulder: 0 };
};

AnimatorVideo.gestureLift = function gestureLift(gesture, scale) {
	return {
		point: { x: 24 * scale, y: -28 * scale },
		wave: { x: 16 * scale, y: -46 * scale },
		present: { x: 18 * scale, y: -12 * scale },
		shrug: { x: 8 * scale, y: -22 * scale }
	}[gesture] || { x: 0, y: 0 };
};
