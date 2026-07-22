// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldSocketOpen.js
 * @description Resolves an open socket or rejects within a finite, cancellable interval.
 * The Awtsmoos renews potential connection into actual connection; Awtsmoos.com refuses
 * an eternal unopened wire that could otherwise imprison the shared-world doorway.
 */

export function waitForMitzvahWorldSocketOpen(socket, options = {}) {
	if (socket.readyState === 1) return Promise.resolve(socket);
	const timeoutMs = options.timeoutMs ?? 8000;
	const schedule = options.schedule || globalThis.setTimeout?.bind(globalThis);
	const cancelSchedule = options.cancelSchedule || globalThis.clearTimeout?.bind(globalThis);
	return new Promise((resolve, reject) => {
		let timer = null;
		const cleanup = () => {
			if (timer !== null) cancelSchedule?.(timer);
			socket.removeEventListener?.('open', handleOpen);
			socket.removeEventListener?.('error', handleError);
			socket.removeEventListener?.('close', handleClose);
			options.signal?.removeEventListener?.('abort', handleAbort);
		};
		const fail = error => {
			cleanup();
			reject(error);
		};
		const handleOpen = () => {
			cleanup();
			resolve(socket);
		};
		const handleError = event => fail(Object.assign(
			new Error('The Mitzvah World socket failed to open.'),
			{ event }
		));
		const handleClose = () => fail(new Error('The Mitzvah World socket closed before opening.'));
		const handleAbort = () => fail(Object.assign(new Error('Socket opening was cancelled.'), {
			name: 'AbortError'
		}));
		socket.addEventListener('open', handleOpen);
		socket.addEventListener('error', handleError);
		socket.addEventListener('close', handleClose);
		options.signal?.addEventListener?.('abort', handleAbort, { once: true });
		if (schedule && timeoutMs > 0) {
			timer = schedule(() => {
				socket.close?.();
				fail(Object.assign(new Error('The Mitzvah World socket did not open in time.'), {
					code: 'SOCKET_OPEN_TIMEOUT'
				}));
			}, timeoutMs);
			timer?.unref?.();
		}
	});
}
