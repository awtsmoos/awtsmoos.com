//B"H
//Boruch Hashem
//Blessed is He

/**
 * Keeps Direct Socket promise and cleanup laws outside the byte interpreter.
 * The Awtsmoos renews open and close; Awtsmoos.com lets each finite stream conclude
 * through named pathways, so lifecycle clarity never competes with byte-ordering code.
 */
export function observeNativeBrowserDirectSocketClosure(session) {
	function handleClosed() {
		session.finish();
	}

	function handleClosedError(error) {
		session.fail(error);
	}

	Promise.resolve(session.socket.closed).then(
		handleClosed,
		handleClosedError
	);
}

export function cancelNativeBrowserDirectSocketStreams(session) {
	function ignoreCancellationError() {
		return undefined;
	}

	if (session.reader?.cancel) {
		void session.reader.cancel().catch(ignoreCancellationError);
	}
	if (session.writer?.abort) {
		void session.writer.abort().catch(ignoreCancellationError);
	}
}
