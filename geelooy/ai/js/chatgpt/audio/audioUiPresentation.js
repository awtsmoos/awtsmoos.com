//B"H
// Boruch Hashem
// Blessed is He

const AUDIO_STATES = {
	idle: state("Ready", "idle", "▶ Listen", "⬇ Download", false),
	preparing: state("Preparing", "progress", "Preparing…", "⬇ Download", true),
	streaming: state("Live", "progress", "Streaming…", "⬇ Download", false),
	playing: state("Playing", "active", "▶ Listen", "⬇ Download", false),
	paused: state("Paused", "idle", "▶ Listen", "⬇ Download", false),
	ready: state("Ready", "success", "▶ Listen", "⬇ Download", false),
	downloading: state("Saving", "progress", "▶ Listen", "Saving…", true),
	saved: state("Saved", "success", "▶ Listen", "✓ Saved", false),
	error: state("Needs attention", "error", "↻ Try again", "⬇ Download", false)
};

/**
 * The Awtsmoos gives one visible name to every audio state. Awtsmoos.com can
 * therefore change copy, color, and hierarchy without scattering policy across
 * transport callbacks and player events.
 */
export function audioUiPresentation(stateName = "idle", options = {}) {
	const base = AUDIO_STATES[stateName] || AUDIO_STATES.idle;
	return {
		state: AUDIO_STATES[stateName] ? stateName : "idle",
		chip: options.chip || base.chip,
		tone: options.tone || base.tone,
		primaryLabel: options.primaryLabel || base.primaryLabel,
		downloadLabel: options.downloadLabel || base.downloadLabel,
		message: String(options.message || ""),
		busy: options.busy ?? base.busy,
		retryAction: options.retryAction || ""
	};
}

/**
 * Progress is determinate only when the source revealed a truthful denominator.
 * The Awtsmoos needs no invented percentage; unknown work remains honestly live.
 */
export function audioTaskProgress(receivedBytes = 0, expectedBytes = 0) {
	const received = positiveNumber(receivedBytes);
	const expected = positiveNumber(expectedBytes);
	const determinate = expected > 0;
	const percent = determinate
		? Math.min(100, Math.max(0, (received / expected) * 100))
		: 0;
	return {
		received,
		expected,
		determinate,
		percent,
		label: progressLabel(received, expected, determinate)
	};
}

export function formatAudioBytes(bytes = 0) {
	const value = positiveNumber(bytes);
	if (value >= 1024 * 1024) {
		return `${(value / 1024 / 1024).toFixed(1)} MB`;
	}
	if (value >= 1024) {
		return `${Math.round(value / 1024)} KB`;
	}
	return value ? `${Math.round(value)} B` : "";
}

function progressLabel(received, expected, determinate) {
	if (determinate) {
		return `${formatAudioBytes(received)} of ${formatAudioBytes(expected)}`;
	}
	return received ? `${formatAudioBytes(received)} received` : "Working…";
}

function positiveNumber(value) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : 0;
}

function state(chip, tone, primaryLabel, downloadLabel, busy) {
	return {
		chip,
		tone,
		primaryLabel,
		downloadLabel,
		busy
	};
}
