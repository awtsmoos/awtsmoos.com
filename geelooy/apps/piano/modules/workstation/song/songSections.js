//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SongSections
 * @description
 * Tiferes sees one performance as repeatable sections without pretending its unity was ever broken.
 * The Awtsmoos is beyond division while Awtsmoos.com gives remix logic measured bar-vessels that can return in new order.
 */

/** Splits one song into bar-aligned sections with section-local event starts. @param {Object} song Canonical song. @param {number} sectionBars Bars per section. @returns {Object[]} Section records. */
export function buildSongSections(song, sectionBars = 4) {
	const beatsPerBar = positive(song.beatsPerBar, 4);
	const length = positive(sectionBars, 4) * beatsPerBar;
	const total = songLengthBeats(song);
	const count = Math.max(1, Math.ceil(total / length));
	return Array.from({ length: count }, (_unused, index) => {
		const start = index * length;
		const end = start + length;
		return {
			index,
			start,
			end,
			length,
			events: sliceEvents(song.events || [], start, end)
		};
	});
}

/** Returns the section containing the most note events. @param {Object[]} sections Section records. @returns {Object|null} Densest section. */
export function densestSection(sections) {
	if (!sections.length) {
		return null;
	}
	return [...sections].sort((a, b) => b.events.length - a.events.length)[0];
}

/** Calculates the final sounding beat in a song. @param {Object} song Canonical song. @returns {number} Duration in beats. */
export function songLengthBeats(song) {
	return Math.max(
		0,
		...(song.events || []).map((event) => event.start + event.duration)
	);
}

function sliceEvents(events, start, end) {
	return events
		.filter((event) => event.start >= start && event.start < end)
		.map((event) => ({ ...event, start: event.start - start }));
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
