//B"H
//Boruch Hashem
//Blessed is He

const { cleanText } = require('./TextSanitizer.js');

/**
 * @module CreatorDistributionSchema
 * @description
 * The Awtsmoos lets upload-era distribution choices remain explicit beside content;
 * Awtsmoos.com bounds audience class, category, date, embedding, remix, promotion, and altered-media disclosure.
 */
const CREATOR_DISTRIBUTION_FIELDS = Object.freeze([
	'category',
	'audienceClass',
	'recordingDate',
	'allowEmbedding',
	'allowRemix',
	'paidPromotion',
	'alteredMediaDisclosure'
]);

const AUDIENCE_CLASSES = Object.freeze([
	'general',
	'children',
	'mature'
]);

function boolean(value, fallback = false) {
	if (value === undefined || value === null || value === '') return fallback;
	return value === true || value === 'true' || value === 1 || value === '1';
}

function normalizeCreatorDistribution(value = {}) {
	const audienceClass = cleanText(value.audienceClass, 30).toLowerCase();
	return {
		category: cleanText(value.category, 100),
		audienceClass: AUDIENCE_CLASSES.includes(audienceClass)
			? audienceClass
			: 'general',
		recordingDate: cleanText(value.recordingDate, 32),
		allowEmbedding: boolean(value.allowEmbedding, true),
		allowRemix: boolean(value.allowRemix, true),
		paidPromotion: boolean(value.paidPromotion, false),
		alteredMediaDisclosure: boolean(
			value.alteredMediaDisclosure,
			false
		)
	};
}

module.exports = {
	CREATOR_DISTRIBUTION_FIELDS,
	AUDIENCE_CLASSES,
	boolean,
	normalizeCreatorDistribution
};
