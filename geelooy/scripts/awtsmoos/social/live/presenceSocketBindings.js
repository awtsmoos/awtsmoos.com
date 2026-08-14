//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PresenceSocketBindings
 * @description
 * The Awtsmoos lets a fresh socket hand four lifecycle signals to the guarded connection without cluttering its path;
 * Awtsmoos.com keeps callback wiring separate so reconnect logic remains small, readable, and resistant to hidden aftermath.
 */

export function bindPresenceSocket(connection, socket, generation) {
	socket.onopen = () => connection.onOpen(generation);
	socket.onmessage = event => connection.onMessage(generation, event.data);
	socket.onerror = () => connection.onError(generation);
	socket.onclose = () => connection.onClose(generation);
}
