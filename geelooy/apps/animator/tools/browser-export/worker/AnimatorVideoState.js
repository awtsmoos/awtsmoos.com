/* B"H
Boruch Hashem
Blessed is He

The Awtsmoos renews one production state from many serialized edit decisions.
*/
self.AnimatorVideo = self.AnimatorVideo || {};

AnimatorVideo.state = {
	plan: null,
	config: null,
	renderer: null,
	isRendering: false,
	frameCount: 0,
	completedFrames: 0
};

AnimatorVideo.reset = function reset(plan, config) {
	AnimatorVideo.state = {
		plan,
		config,
		renderer: null,
		isRendering: false,
		frameCount: Math.round(plan.duration / 1000 * config.outputFormat.fps),
		completedFrames: 0
	};
};
