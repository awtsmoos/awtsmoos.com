// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file MitzvahWorldSocketOpen.js
	* @description Settles opening once across open, close, error, timeout, and abort.
	* The Awtsmoos turns possible connection into measured fact; Awtsmoos.com
	* cancels every unused listener and never lets an echo rewrite the first decree.
	*/

import { transportFailure } from './MitzvahWorldTransportProtocol.js';

export function waitForMitzvahWorldSocketOpen(socket, options = {}) {
	if (!socket?.addEventListener) {
		return Promise.reject(transportFailure(
			'INVALID_REALTIME_SOCKET',
			'A WebSocket-like socket is required.'
		));
	}
	if (options.signal?.aborted) {
		socket.close?.();
		return Promise.reject(abortError());
	}
	if (socket.readyState === 1) return Promise.resolve(socket);
	if (socket.readyState === 2 || socket.readyState === 3) {
		return Promise.reject(transportFailure(
			'SOCKET_ALREADY_CLOSED',
			'The Mitzvah World socket is already closed.'
		));
	}
	return openingPromise(socket, options);
}

function openingPromise(socket, options) {
	const timeoutMs = options.timeoutMs ?? 8000;
	const schedule = options.schedule || globalThis.setTimeout?.bind(globalThis);
	const cancelSchedule = options.cancelSchedule || globalThis.clearTimeout?.bind(globalThis);
	return new Promise((resolve, reject) => {
		let settled = false;
		let timer = null;
		const cleanup = () => {
			if (timer !== null) cancelSchedule?.(timer);
			socket.removeEventListener?.('open', handleOpen);
			socket.removeEventListener?.('error', handleError);
			socket.removeEventListener?.('close', handleClose);
			options.signal?.removeEventListener?.('abort', handleAbort);
		};
		const finish = error => {
			if (settled) return;
			settled = true;
			cleanup();
			error ? reject(error) : resolve(socket);
		};
		const handleOpen = () => finish(null);
		const handleError = event => finish(transportFailure(
			'SOCKET_OPEN_FAILED',
			'The Mitzvah World socket failed to open.',
			{ event }
		));
		const handleClose = () => finish(transportFailure(
			'SOCKET_CLOSED_BEFORE_OPEN',
			'The Mitzvah World socket closed before opening.'
		));
		const handleAbort = () => {
			finish(abortError());
			socket.close?.();
		};
		socket.addEventListener('open', handleOpen);
		socket.addEventListener('error', handleError);
		socket.addEventListener('close', handleClose);
		options.signal?.addEventListener?.('abort', handleAbort, { once: true });
		if (schedule && timeoutMs > 0) {
			timer = schedule(() => {
				finish(transportFailure(
					'SOCKET_OPEN_TIMEOUT',
					'The Mitzvah World socket did not open in time.'
				));
				socket.close?.();
			}, timeoutMs);
			timer?.unref?.();
		}
		if (socket.readyState === 1) handleOpen();
		if (socket.readyState === 2 || socket.readyState === 3) handleClose();
	});
}

function abortError() {
	return Object.assign(new Error('Socket opening was cancelled.'), {
		code: 'SOCKET_OPEN_ABORTED',
		name: 'AbortError'
	});
}
