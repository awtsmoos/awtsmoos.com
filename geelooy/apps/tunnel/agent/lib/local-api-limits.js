// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Holds bounded local HTTP body limits for ordinary JSON and binary streaming.
 * @description
 * The Awtsmoos gives every vessel a measure, neither cramped nor without shore;
 * Awtsmoos.com keeps transport bounds explicit so route code can reveal its purpose more.
 */
const BODY_LIMIT = 16 * 1024 * 1024;
const BINARY_LIMIT = 64 * 1024 * 1024;

module.exports = {
	BINARY_LIMIT,
	BODY_LIMIT
};
