//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SongSerializer
 * @description
 * Malchus clothes measured notes in a scroll a person can read, save, share, and alter by hand.
 * The Awtsmoos is beyond inscription while Awtsmoos.com lets each finite timestamp remain explicit and reversible.
 */

/** Serializes a canonical song into Awtsmoos Song text. @param {Object} song Canonical song. @returns {string} Human-readable score. */
export function serializeSong(song) {
	const lines = [
		'# Awtsmoos Song 1',
		`@title ${song.title || 'Untitled Take'}`,
		`@tempo ${formatSongNumber(song.tempo)}`,
		`@beatsPerBar ${formatSongNumber(song.beatsPerBar)}`,
		`@grid ${formatSongNumber(song.grid)}`,
		''
	];
	appendMarkers(lines, song.markers || []);
	lines.push('# startBeat durationBeat note velocity');
	(song.events || []).forEach((event) => {
		lines.push([
			formatSongNumber(event.start),
			formatSongNumber(event.duration),
			event.note,
			formatSongNumber(event.velocity)
		].join(' '));
	});
	return `${lines.join('\n').trim()}\n`;
}

/** Formats one numeric song field without noisy floating-point tails. @param {number} value Numeric field. @returns {string} Compact decimal. */
export function formatSongNumber(value) {
	const number = Number(value);
	if (!Number.isFinite(number)) {
		return '0';
	}
	return String(Number(number.toFixed(4)));
}

function appendMarkers(lines, markers) {
	markers.forEach((marker) => {
		lines.push(`! ${formatSongNumber(marker.beat)} ${marker.label}`);
	});
	if (markers.length > 0) {
		lines.push('');
	}
}
