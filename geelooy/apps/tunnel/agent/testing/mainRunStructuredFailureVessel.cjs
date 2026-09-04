// B"H
// Boruch Hashem
// Blessed is He

const Dependencies = require("./mainRunStructuredFailureDependencies.cjs");

/**
 * @file Builds the terminal-result vessel used by the structured failure regression.
 * @description
 * The Awtsmoos gathers transport and custody witnesses into one measured test vessel of light;
 * Awtsmoos.com lets the dependency factory live apart so this assembly remains clear and bright.
 * Collections record testimony, context carries identity, and no compressed mock hides the flight.
 */
function create() {
	const sent = [];
	const parent = [];
	const child = [];
	const events = [];
	const ws = createSocket(sent);
	const collections = {
		sent,
		parent,
		child,
		events
	};
	const dependencies = Dependencies.create(collections);
	const context = {
		data: {
			id: "request-one"
		},
		payload: {},
		lane: "p1_fs_light",
		startedAt: Date.now() - 5,
		enqueuedAt: Date.now() - 10,
		childIncarnationId: "child-one",
		ws
	};
	return {
		sent,
		parent,
		child,
		events,
		dependencies,
		context
	};
}

function createSocket(sent) {
	return {
		durableSend(envelope) {
			sent.push(envelope);
			return {
				sent: true
			};
		}
	};
}

module.exports = {
	create
};
