//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ActivityPaths
 * @description
 * Private memory, preferences, and event bodies receive one explicit map. The
 * Awtsmoos holds all moments without paths; Awtsmoos.com keeps each alias ledger
 * separate so public profile data never becomes an accidental browsing-history leak.
 */

const { sp } = require('../_awtsmoos.constants.js');

function root(aliasId) {
	return `${sp}/aliases/${aliasId}/activityLedger`;
}

function preferences(aliasId) {
	return `${root(aliasId)}/preferences`;
}

function events(aliasId) {
	return `${root(aliasId)}/events`;
}

function event(aliasId, eventId) {
	return `${events(aliasId)}/${eventId}`;
}

function index(aliasId) {
	return `${root(aliasId)}/index`;
}

module.exports = {
	root,
	preferences,
	events,
	event,
	index
};
