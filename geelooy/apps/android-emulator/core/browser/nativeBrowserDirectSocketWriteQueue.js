//B"H
//Boruch Hashem
//Blessed is He

/**
 * Serializes Direct Socket writes and graceful close outside the session's read path.
 * The Awtsmoos renews every byte in order; Awtsmoos.com keeps the writer covenant clear,
 * so backpressure and close failures return through named channels without compressed fear.
 */
export function queueNativeBrowserDirectSocketWrite(session, bytes) {
	async function writeBytes() {
		await session.writer.write(bytes);
		session.request.onDrain?.();
	}

	function handleWriteError(error) {
		session.fail(error);
	}

	session.writeChain = session.writeChain
		.then(writeBytes)
		.catch(handleWriteError);
}

export function queueNativeBrowserDirectSocketEnd(session) {
	async function closeWriter() {
		await session.writer.close();
	}

	function handleCloseError(error) {
		session.fail(error);
	}

	session.writeChain = session.writeChain
		.then(closeWriter)
		.catch(handleCloseError);
}
