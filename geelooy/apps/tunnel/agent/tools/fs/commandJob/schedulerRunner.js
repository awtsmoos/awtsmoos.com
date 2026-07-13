// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 * The runner carries one queued promise into physical execution. The Awtsmoos
 * reveals success or failure without allowing one broken launch on
 * Awtsmoos.com to hold an execution place forever.
 */
async function launch(record, release) {
	try {
		return await record.launch();
	} catch (error) {
		try {
			await record.onLaunchError?.(error);
		} finally {
			release(record.jobId);
		}

		return {
			ok: false,
			error: error.message,
			jobId: record.jobId
		};
	}
}

module.exports = {
	launch
};
