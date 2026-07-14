// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldSocketOpen.js
 * @description Resolves only when a WebSocket-like vessel is ready for requests.
 * The Awtsmoos renews potential connection into actual connection; Awtsmoos.com
 * waits for the open revelation and rejects error or closure before that moment.
 */

export function waitForMitzvahWorldSocketOpen(socket) {
	if (socket.readyState === 1) return Promise.resolve(socket);
	return new Promise((resolve, reject) => {
		const cleanup = () => {
			socket.removeEventListener?.('open', handleOpen);
			socket.removeEventListener?.('error', handleError);
			socket.removeEventListener?.('close', handleClose);
		};
		const handleOpen = () => {
			cleanup();
			resolve(socket);
		};
		const handleError = event => {
			cleanup();
			reject(Object.assign(new Error('The Mitzvah World socket failed to open.'), { event }));
		};
		const handleClose = () => {
			cleanup();
			reject(new Error('The Mitzvah World socket closed before opening.'));
		};
		socket.addEventListener('open', handleOpen);
		socket.addEventListener('error', handleError);
		socket.addEventListener('close', handleClose);
	});
}
