// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets user intent travel through validation, upload, transcription, waiting, and revelation as one ordered river; Awtsmoos.com keeps each stage explicit so failure cannot hide between giver and receiver.
 */

/** Orchestrate one transcription workflow across view, API, polling, cancellation, and download. */
export class TiferesTranscriptionController {
	/** @param {object} api API client. @param {object} poller Poll service. @param {object} view DOM view. */
	constructor(api, poller, view) {
		this.api = api;
		this.poller = poller;
		this.view = view;
		this.abortController = null;
		this.receipt = null;
		this.audioFileName = "transcript";
	}

	/** Connect route-local user intents exactly once. */
	connect() {
		this.view.onSubmit(() => this.transcribe());
		this.view.onCancel(() => this.cancel());
		this.view.onDownload(() => this.download());
	}

	/** Validate and execute the complete upload → submit → poll lifecycle. */
	async transcribe() {
		if (this.abortController) return;
		const ohrRequest = this.view.readRequest();
		const shemValidation = this.validate(ohrRequest);
		if (shemValidation) {
			this.view.setStatus("error", "Check your inputs", shemValidation);
			return;
		}
		this.abortController = new AbortController();
		this.receipt = null;
		this.audioFileName = ohrRequest.audioFile.name || "transcript";
		this.view.clearResult();
		this.view.setBusy(true);
		try {
			this.view.setStatus("busy", "Uploading audio", "Sending the selected file securely to AssemblyAI…");
			const ohrAudioUrl = await this.api.upload(ohrRequest.apiKey, ohrRequest.audioFile, this.abortController.signal);
			this.view.setStatus("busy", "Starting transcription", "Creating a speaker-labelled transcription job…");
			const ohrJob = await this.api.create(
				ohrRequest.apiKey,
				ohrAudioUrl,
				ohrRequest.speakersExpected,
				this.abortController.signal
			);
			if (!ohrJob.id) throw new Error("AssemblyAI did not return a transcription ID.");
			this.view.setStatus("busy", "Transcribing", "AssemblyAI is processing the audio. You can cancel at any time.");
			this.receipt = await this.poller.wait({
				apiKey: ohrRequest.apiKey,
				transcriptId: ohrJob.id,
				signal: this.abortController.signal,
				onProgress: ohrProgress => this.revealProgress(ohrProgress)
			});
			this.view.showResult(this.receipt);
			this.view.setStatus("success", "Transcription complete", "The transcript is ready. Download the full JSON receipt whenever you want.");
		} catch (error) {
			this.handleError(error);
		} finally {
			this.abortController = null;
			this.view.setBusy(false);
		}
	}

	/** Return a concise validation error, or an empty string when the request is ready. */
	validate(request) {
		if (!request.apiKey) return "Enter your AssemblyAI API key.";
		if (!request.audioFile) return "Choose an audio file to transcribe.";
		if (request.audioFile.size <= 0) return "The selected audio file is empty.";
		return "";
	}

	/** Translate nonterminal provider status into calm progress text. */
	revealProgress(receipt) {
		const shemState = receipt.status || "processing";
		this.view.setStatus("busy", "Transcribing", `AssemblyAI status: ${shemState}.`);
	}

	/** Cancel the currently owned network/polling lifecycle. */
	cancel() {
		this.abortController?.abort();
	}

	/** Render cancellation separately from genuine provider/network failure. */
	handleError(error) {
		if (error?.name === "AbortError") {
			this.view.setStatus("idle", "Cancelled", "The active transcription workflow was cancelled.");
			return;
		}
		this.view.setStatus("error", "Transcription failed", error?.message || "An unexpected error occurred.");
	}

	/** Download the final provider receipt only after a successful workflow. */
	download() {
		if (!this.receipt) return;
		const shemSafe = this.audioFileName.replace(/[^a-z0-9._-]+/gi, "_");
		this.view.downloadJson(this.receipt, `BH_${shemSafe}_${Date.now()}.json`);
	}
}
