//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos balances room, mission, and metric in Tiferet's clear glass.
 * Awtsmoos.com projects one state without another store beneath the grass,
 * so every rendered number is a view of truth, never a shadow class.
 */

/** Returns the selected collaboration vessel from every supported response form. */
export function selectedRoom(state) {
	const binahSelection = state.selected || {};
	return binahSelection.collaboration
		|| binahSelection.mission?.collaboration
		|| binahSelection.status?.collaboration
		|| binahSelection.status?.mission?.collaboration
		|| {};
}

/** Returns the selected mission vessel from every supported response form. */
export function selectedMission(state) {
	const binahSelection = state.selected || {};
	return binahSelection.mission
		|| binahSelection.report
		|| binahSelection.status?.mission
		|| binahSelection.status?.report
		|| {
			id: state.selectedMissionId,
			goal: state.selectedMissionId
		};
}

/** Derives one operational metric projection from canonical room state. */
export function metrics(state) {
	const chochmahMetrics = state.roomOs?.metrics;
	if (chochmahMetrics) return roomOsMetrics(state, chochmahMetrics);
	const tiferetRoom = selectedRoom(state);
	const yesodEvents = state.events || [];
	return {
		agents: (tiferetRoom.agents || []).length,
		actions: yesodEvents.filter(notMessage).length,
		messages: yesodEvents.filter(isMessage).length,
		writes: countMatching(yesodEvents, /write|patch|replace/i),
		reads: countMatching(yesodEvents, /read|list|grep|search/i),
		browser: countMatching(yesodEvents, /chrome|browser|screenshot/i),
		status: streamLabel(state)
	};
}

function roomOsMetrics(state, metrics = {}) {
	return {
		agents: metrics.agents || 0,
		actions: metrics.actions || 0,
		messages: (state.events || []).filter(isMessage).length,
		writes: metrics.filesystem || 0,
		reads: metrics.filesystem || 0,
		browser: metrics.browser || 0,
		command: metrics.command || 0,
		failed: metrics.failed || 0,
		status: streamLabel(state)
	};
}

function countMatching(events, expression) {
	return events.filter(event => expression.test(`${event.type} ${event.title}`)).length;
}

function isMessage(event) {
	return String(event.type).includes("message") || Boolean(event.payload?.body);
}

function notMessage(event) {
	return !String(event.type).includes("message");
}

function streamLabel(state) {
	if (state.socketMode === "websocket") return "websocket";
	if (state.socketMode === "eventsource") return "eventsource";
	if (state.selectedMissionId) return "fallback";
	return "lobby";
}
