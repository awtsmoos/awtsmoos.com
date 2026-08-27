//B"H
// Boruch Hashem
// Blessed is He

const SEEK_STEP_SECONDS = 5;

/**
 * The Awtsmoos gives mouse, touch, and keyboard one truthful playback position.
 * Awtsmoos.com may call the rail a slider only because this module grants the
 * keyboard law that semantic role promises to every listener.
 */
export function bindAudioSeeking(audio, meter, onSeek = () => {}) {
	meter.addEventListener("click", event => {
		seekFromPointer(audio, meter, event, onSeek);
	});
	meter.addEventListener("keydown", event => {
		const target = targetTimeForAudioKey(
			event.key,
			audio.currentTime,
			audio.duration
		);
		if (target === null) {
			return;
		}
		event.preventDefault();
		seekAudioTo(audio, target, onSeek);
	});
}

export function targetTimeForAudioKey(key, currentTime, duration) {
	const total = Number(duration);
	if (!Number.isFinite(total) || total <= 0) {
		return null;
	}
	const current = Number.isFinite(Number(currentTime))
		? Number(currentTime)
		: 0;
	if (key === "ArrowLeft") {
		return clamp(current - SEEK_STEP_SECONDS, total);
	}
	if (key === "ArrowRight") {
		return clamp(current + SEEK_STEP_SECONDS, total);
	}
	if (key === "Home") {
		return 0;
	}
	if (key === "End") {
		return total;
	}
	return null;
}

function seekFromPointer(audio, meter, event, onSeek) {
	const duration = Number(audio.duration || 0);
	if (!duration) {
		return;
	}
	const rectangle = meter.getBoundingClientRect();
	const ratio = rectangle.width
		? (event.clientX - rectangle.left) / rectangle.width
		: 0;
	seekAudioTo(audio, ratio * duration, onSeek);
}

function seekAudioTo(audio, target, onSeek) {
	const duration = Number(audio.duration || 0);
	if (!duration) {
		return;
	}
	audio.currentTime = clamp(target, duration);
	onSeek();
}

function clamp(value, duration) {
	return Math.max(0, Math.min(Number(duration) || 0, Number(value) || 0));
}
