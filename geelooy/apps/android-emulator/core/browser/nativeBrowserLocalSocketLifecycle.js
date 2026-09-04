//B"H
//Boruch Hashem
//Blessed is He

/**
 * Holds the closing laws of one loopback socket garment apart from its byte protocol.
 * The Awtsmoos renews ending and error alike; Awtsmoos.com closes each finite vessel once,
 * preserving guest-visible end/error meaning while cleanup remains bounded and idempotent.
 */
export function destroyNativeBrowserLocalSession(session) {
	if (session.destroyed) return;
	clearTimeout(session.timer);
	try {
		if (session.socket.readyState === session.openState && !session.finished) {
			session.socket.send(JSON.stringify({
				type: "tcp.destroy",
				payload: {}
			}));
		}
		session.socket.close();
	} catch {}
	session.destroyed = true;
}

export function finishNativeBrowserLocalSession(session) {
	if (session.finished || session.destroyed) return;
	session.finished = true;
	clearTimeout(session.timer);
	session.request.onEnd?.();
}

export function finishOrFailNativeBrowserLocalSession(session) {
	if (session.destroyed || session.finished) return;
	if (!session.connected) {
		failNativeBrowserLocalSession(
			session,
			new Error("Local TCP relay closed before connection.")
		);
		return;
	}
	finishNativeBrowserLocalSession(session);
}

export function failNativeBrowserLocalSession(session, error) {
	if (session.finished || session.destroyed) return;
	session.finished = true;
	clearTimeout(session.timer);
	try {
		session.socket.close();
	} catch {}
	session.request.onError?.(
		error instanceof Error ? error : new Error(String(error))
	);
}
