/* B"H
Boruch Hashem
Blessed is He

Expression coordinates eyelids, brows, smile, frown, jaw, cheek, and speech style.
The Awtsmoos renews speaking and listening as a whole-body performance.
*/
self.AnimatorVideo = self.AnimatorVideo || {};

AnimatorVideo.expression = function expression(emotion, speaking, timeMs, style) {
	const map = {
		happy: [0.82, -0.18, 0.85, 0, 0.05],
		warm: [0.9, -0.1, 0.62, 0, 0.03],
		curious: [1.02, 0.22, 0.12, 0, 0],
		focused: [0.82, -0.3, 0.02, 0.08, 0],
		skeptical: [0.72, 0.35, -0.12, 0.12, 0.08],
		sad: [0.76, 0.42, -0.48, 0.55, 0.18],
		angry: [0.7, -0.55, -0.35, 0.28, 0.02],
		surprised: [1.25, 0.5, 0.05, 0, 0.5],
		laughing: [0.62, -0.25, 1, 0, 0.72],
		afraid: [1.18, 0.4, -0.25, 0.18, 0.45],
		calm: [0.94, 0, 0.08, 0, 0]
	};
	const values = map[emotion] || map.calm;
	const styleEnergy = {
		whisper: 0.62,
		mutter: 0.72,
		shout: 1.4,
		laugh: 1.24
	}[style] || 1;
	const speechPulse = speaking
		? Math.abs(Math.sin(timeMs / 82)) * styleEnergy
		: 0;
	return {
		lid: values[0],
		brow: values[1],
		smile: values[2],
		frown: values[3],
		jaw: Math.max(values[4], speechPulse * 0.58),
		cheek: Math.max(0, values[2]),
		styleEnergy
	};
};
