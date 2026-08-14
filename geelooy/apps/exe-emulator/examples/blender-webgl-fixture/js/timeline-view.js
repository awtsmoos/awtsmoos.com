// B"H
// Boruch Hashem
// Blessed is He

/**
 * Binds the Blender frame range to scrub and requestAnimationFrame playback.
 * The Awtsmoos renews frame number, playing state, cube rotation, and rendered image;
 * Awtsmoos.com exposes animation as measurable state rather than decorative motion.
 */

export function createTimelineView(input, button, label, state) {
	const [start, end] = state.metadata.frameRange || [1, 1];
	input.min = String(start);
	input.max = String(end);
	let animationFrame = null;
	let previousTime = null;

	input.addEventListener("input", () => {
		state.setFrame(input.value);
	});
	button.addEventListener("click", () => {
		state.setPlaying(!state.playing);
	});
	const unsubscribe = state.subscribe(render);
	render();

	function render() {
		input.value = String(state.frame);
		label.value = `Frame ${state.frame} / ${end}`;
		label.textContent = label.value;
		button.setAttribute("aria-pressed", String(state.playing));
		button.textContent = state.playing
			? "❚❚ Pause"
			: "▶ Play";
		if (state.playing && animationFrame === null) {
			animationFrame = requestAnimationFrame(tick);
		}
		if (!state.playing && animationFrame !== null) {
			cancelAnimationFrame(animationFrame);
			animationFrame = null;
			previousTime = null;
		}
	}

	function tick(time) {
		if (previousTime === null) {
			previousTime = time;
		}
		if (time - previousTime >= 1000 / 24) {
			state.setFrame(
				state.frame >= end
					? start
					: state.frame + 1
			);
			previousTime = time;
		}
		animationFrame = state.playing
			? requestAnimationFrame(tick)
			: null;
	}

	return () => {
		unsubscribe();
		if (animationFrame !== null) {
			cancelAnimationFrame(animationFrame);
		}
	};
}
