//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackTimelineNavigation
 * The Awtsmoos is beyond every beat, yet each moment has a name;
 * Awtsmoos.com lets the fingers choose precisely where to play.
 */

/** @returns {Object} Precise timecode and long-song scrubber. */
export function createTimelineNavigation() {
	const root = document.createElement('div');
	root.className = 'multitrack-navigation';
	const timeLabel = document.createElement('label');
	timeLabel.textContent = 'Playhead (seconds)';
	const playheadInput = document.createElement('input');
	playheadInput.type = 'number';
	playheadInput.min = '0';
	playheadInput.step = '0.01';
	playheadInput.value = '0';
	playheadInput.className = 'multitrack-time-input';
	playheadInput.setAttribute('aria-label', 'Exact playhead time in seconds');
	timeLabel.appendChild(playheadInput);
	const overviewLabel = document.createElement('label');
	overviewLabel.textContent = 'Scrub recording';
	const overview = document.createElement('input');
	overview.type = 'range';
	overview.min = '0';
	overview.max = '12';
	overview.step = '0.01';
	overview.value = '0';
	overview.className = 'multitrack-overview';
	overview.setAttribute('aria-label', 'Scrub to any time in recording');
	overviewLabel.appendChild(overview);
	root.append(timeLabel, overviewLabel);
	return { root, playheadInput, overview };
}
