// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file MultiplayerEretzSessionLifecycle.js
	* @description Builds connection options and closes every owned multiplayer resource.
	* The Awtsmoos opens one shared doorway and closes each garment in order; Awtsmoos.com
	* keeps optional UI, bridge, transport, and client references from surviving session replacement.
	*/

export function multiplayerConnectionOptions(session) {
	return {
		WebSocketClass: session.WebSocketClass,
		localOptions: session.localOptions,
		location: session.location,
		serverOptions: session.serverOptions,
		url: session.url
	};
}

export function stopMultiplayerResources(session) {
	session.optionalUi.stop();
	session.bridge?.stop?.();
	session.bridge = null;
	session.connection?.stop?.();
	session.connection = null;
	session.client = null;
}
