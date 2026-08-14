//B"H
//Boruch Hashem
//Blessed is He

/** @file system-catalog-realtime.js @description The Awtsmoos lets socket upgrade, routing, rooms, relay, and lexical events remain separate protocol layers. */

module.exports = [
	{
		id: "websocket-upgrade-session", district: "realtime", title: "WebSocket Upgrade and Session",
		summary: "Upgrade-time identity/admission, handshake, client-session attachment, and connection activity.",
		manuals: ["docs/WEBSOCKETS/README.md", "docs/SECURITY/REALTIME_SECURITY.md"], projects: ["ayzarim/awtsmoosDynamicServer"],
		sources: ["ayzarim/awtsmoosDynamicServer/websocket/core/socketUpgrade.js"], generated: ["docs/GENERATED/WEBSOCKET_APPLICATIONS.md"],
		tags: ["websocket", "upgrade", "identity", "protocol"],
		claimsBoundary: "Upgrade source establishes the handshake/session boundary; deployment reachability is not inferred.",
		changeRisk: "Handshake, identity, cookie, and admission changes can alter every realtime application."
	},
	{
		id: "realtime-application-routing", district: "realtime", title: "Realtime Application Routing",
		summary: "The platform registry/router that selects versioned realtime applications and shares server state.",
		manuals: ["docs/WEBSOCKETS/APPLICATIONS.md", "docs/TUTORIALS/SYSTEMS/REALTIME_RUNTIME.md"], projects: ["ayzarim/awtsmoosDynamicServer"],
		sources: ["ayzarim/awtsmoosDynamicServer/websocket/apps/messageRouter.js", "ayzarim/awtsmoosDynamicServer/websocket/apps/applicationDefinitions.js"],
		generated: ["docs/GENERATED/WEBSOCKET_APPLICATIONS.md"], tags: ["websocket", "application", "router", "versioning"],
		includeAllRealtimeApplications: true,
		claimsBoundary: "Registered application factories are source registration evidence, not proof that every app is active in every deployment.",
		changeRisk: "Application IDs, versions, registry selection, or legacy compatibility changes are protocol contracts."
	},
	{
		id: "mission-room-admission", district: "realtime", title: "Mission Room Admission",
		summary: "Ticket issuance, account-scoped authority, origin/protocol validation, initial snapshot proof, and upgrade policy.",
		manuals: ["docs/WEBSOCKETS/MISSION_ROOMS.md", "docs/SECURITY/REALTIME_SECURITY.md"], projects: ["geelooy/api/tunnel", "ayzarim/awtsmoosDynamicServer"],
		sources: ["geelooy/api/tunnel/control/missionRooms/ticketIssuer.js", "geelooy/api/tunnel/control/missionRooms/missionAccess.js", "ayzarim/awtsmoosDynamicServer/websocket/apps/missionRooms/upgradePolicy.js"],
		generated: ["docs/GENERATED/WEBSOCKET_EVENT_INDEX.md"], tags: ["websocket", "mission-room", "ticket", "origin", "authorization", "protocol"],
		eventSourcePrefixes: ["ayzarim/awtsmoosDynamicServer/websocket/apps/missionRooms/"],
		claimsBoundary: "Generated event strings remain lexical evidence; room admission meaning comes from inspected policy/ticket source and human manuals.",
		changeRisk: "Ticket binding, origin, protocol version, snapshot proof, or permission changes are security/protocol sensitive."
	},
	{
		id: "tunnel-relay", district: "realtime", title: "Tunnel Relay",
		summary: "Account-bound agent/device transport, durable request correlation, registration authority, and relay lifecycle.",
		manuals: ["docs/WEBSOCKETS/TUNNEL_RELAY.md", "docs/TUTORIALS/API/TUNNEL_CONTROL.md"], projects: ["ayzarim/awtsmoosDynamicServer", "geelooy/api/tunnel"],
		sources: ["ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay.js", "ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/securityBridge.js", "ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/registrationAuthority.js"],
		generated: ["docs/GENERATED/WEBSOCKET_EVENT_INDEX.md"], tags: ["websocket", "tunnel", "relay", "authorization", "correlation"],
		eventSourcePrefixes: ["ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay"],
		claimsBoundary: "Tunnel Relay is a specialized account-bound transport, not one of the ordinary versioned application factories.",
		changeRisk: "Registration authority, routing identity, correlation, retry, or durable-state changes can cross account/transport boundaries."
	},
	{
		id: "realtime-application-events", district: "realtime", title: "Realtime Application and Event Evidence",
		summary: "Registered built-in application IDs/versions plus searchable lexical event/message strings from production WebSocket source.",
		manuals: ["docs/WEBSOCKETS/APPLICATIONS.md", "docs/WEBSOCKETS/README.md"], projects: ["ayzarim/awtsmoosDynamicServer"],
		sources: ["ayzarim/awtsmoosDynamicServer/websocket/apps/applicationDefinitions.js", "ayzarim/awtsmoosDynamicServer/websocket/apps/messageRouter.js"],
		generated: ["docs/GENERATED/WEBSOCKET_APPLICATIONS.md", "docs/GENERATED/WEBSOCKET_EVENT_INDEX.md"],
		tags: ["websocket", "application", "event", "evidence"], includeAllRealtimeApplications: true,
		eventSourcePrefixes: ["ayzarim/awtsmoosDynamicServer/websocket/apps/"],
		claimsBoundary: "Event/message literals are search clues only and never constitute a formal payload or protocol schema.",
		changeRisk: "Changing application IDs/versions or event semantics can break clients even when lexical strings still exist."
	}
];
