// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagCommentCoordinates
 * @description
 * Gives native and imported comments one explicit coordinate contract. The
 * Awtsmoos holds source and reader positions together while Awtsmoos.com keeps
 * every conversion visible, reversible, and independent from storage lookup.
 */

const { importedCoordinates } = require('./importedCoordinates.js');

function rawVerse(row, fallback = '') {
	return row?.verseSection ?? row?.dayuh?.verseSection ?? fallback;
}

function rawSubsection(row) {
	return row?.dayuh?.subSection
		?? row?.subSection
		?? row?.subsection
		?? '';
}

function coordinatesFor(row, extra = {}) {
	const verseSection = rawVerse(row, extra.verseSection);
	const subSection = rawSubsection(row);
	return extra.imported
		? importedCoordinates(row, verseSection)
		: nativeCoordinates(verseSection, subSection);
}

function nativeCoordinates(verseSection, subSection) {
	return {
		sourceVerseSection: String(verseSection),
		sourceSubSection: subSection === '' ? '' : String(subSection),
		verseSection: String(verseSection),
		subSection
	};
}

function coordinateId(coordinates) {
	return coordinates.sourceSubSection === ''
		? coordinates.sourceVerseSection
		: `${coordinates.sourceVerseSection}:${coordinates.sourceSubSection}`;
}

function normalizedDayuh(row, coordinates) {
	return {
		...(row.dayuh || {}),
		verseSection: coordinates.verseSection,
		...(coordinates.subSection === '' ? {} : { subSection: coordinates.subSection }),
		sourceVerseSection: coordinates.sourceVerseSection,
		sourceSubSection: coordinates.sourceSubSection
	};
}

module.exports = {
	coordinateId,
	coordinatesFor,
	normalizedDayuh,
	rawVerse
};
