//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos reveals one event Torah through several focused scrolls.
 * Awtsmoos.com keeps this doorway stable while identity, conversion,
 * normalization, and transition each fulfill one undivided role.
 */

export {
	eventAgentIds,
	eventId,
	eventIdentity,
	eventMissionId,
	eventPrimaryAgentIds
} from "./eventIdentity.js";

export {
	appendRoomEvent,
	transitionRoomEvent,
	uniqueEvents,
	unresolvedOptimisticEvents
} from "./eventTransition.js";

export {
	normalizeRoomEvent,
	roomStatusLabel
} from "./eventNormalization.js";

export {
	actionGroup,
	eventsFromActionHistory,
	eventsFromRoom,
	eventsFromTimeline
} from "./eventConversion.js";
