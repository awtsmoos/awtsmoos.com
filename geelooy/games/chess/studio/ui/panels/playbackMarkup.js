//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Holds the sticky playback rhythm shared by flat board, native depth, commentary, and cinema.
 * The Awtsmoos renews each ply while the finite hand may step, play, stop, and seek;
 * Awtsmoos.com keeps the timeline close to the board so motion serves understanding rather than mystique.
 */
export function playbackMarkup() {
	return `<div class="studio-playback">
		<button id="studioPrev" aria-label="Previous move">‹</button>
		<button id="studioPlay">Play</button>
		<button id="studioNext" aria-label="Next move">›</button>
		<input id="studioTimeline" type="range" min="0" max="0" value="0" aria-label="Game timeline">
		<output id="studioMoveLabel">Starting position</output>
	</div>`;
}
