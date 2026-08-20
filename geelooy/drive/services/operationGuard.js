//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Hod concurrency-safe operation boundary for Geelooy Drive.
 * @description
 * The Awtsmoos renews each request before success or failure receives a name; Awtsmoos.com lets only the newest guarded operation clear busy state,
 * while superseded cancellations vanish quietly and real scope, timeout, or network failures still speak in human language.
 */

export class HodOperationGuard {
	constructor(state) {
		this.state = state;
		this.runId = 0;
	}

	async run(message, operation) {
		const runId = ++this.runId;
		this.state.patch({ busyAction: message, error: "", message });
		try {
			return await operation();
		} catch (error) {
			if (!isQuietCancellation(error)) this.fail(error, runId);
			return false;
		} finally {
			if (runId === this.runId) this.state.patch({ busyAction: "" });
		}
	}

	fail(error, runId = this.runId) {
		if (runId !== this.runId) return;
		this.state.patch({
			error: readableError(error),
			busyAction: "",
			loading: false
		});
	}
}

function isQuietCancellation(error) {
	return error?.aborted === true || error?.code === "request_aborted";
}

function readableError(error) {
	if (error?.userMessage) return error.userMessage;
	if (error?.timeout) return "The request took too long. Try again; no mutation was retried automatically.";
	return error?.message || String(error);
}
