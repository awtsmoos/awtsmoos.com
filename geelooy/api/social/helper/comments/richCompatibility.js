// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module RichCommentCompatibility
 * @description Public legacy comment facade over dedicated read/mutation modules.
 */
const read = require('./richCompatibilityRead.js');
const mutation = require('./richCompatibilityMutation.js');

function source($i) {
	return {
		...($i.$_GET || {}),
		...($i.$_POST || {}),
		...($i.$_PUT || {}),
		...($i.$_DELETE || {})
	};
}

function seriesFrom(value = {}) {
	return value.seriesId || value.series || 'root';
}

function verseFrom(value = {}) {
	const verse = value.verseSection ?? value.idx;
	return verse === '' || verse === null || verse === undefined ? '' : String(verse);
}

module.exports = {
	...read,
	...mutation,
	seriesFrom,
	source,
	verseFrom
};
