// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets network state become humane visible language; Awtsmoos.com keeps busy, success, error, transcript, and download truth in one semantic view.
 */

/** DOM view for the transcription workflow, with no network policy or API knowledge. */
export class MalchusTranscriptionView {
	/** Capture the route-local semantic elements once. */
	constructor(root = document) {
		this.form = root.querySelector("#transcribe-form");
		this.workflow = root.querySelector("#workflow");
		this.apiKey = root.querySelector("#apiKey");
		this.audioFile = root.querySelector("#audioFile");
		this.speakers = root.querySelector("#speakers");
		this.submitButton = root.querySelector("#submitButton");
		this.cancelButton = root.querySelector("#cancelButton");
		this.statusPanel = root.querySelector("#statusPanel");
		this.statusTitle = root.querySelector("#statusTitle");
		this.statusMessage = root.querySelector("#statusMessage");
		this.resultPanel = root.querySelector("#resultPanel");
		this.transcriptText = root.querySelector("#transcriptText");
		this.downloadButton = root.querySelector("#downloadButton");
	}

	/** Return normalized user input without mutating it. */
	readRequest() {
		return {
			apiKey: this.apiKey.value.trim(),
			audioFile: this.audioFile.files?.[0] ?? null,
			speakersExpected: Math.max(1, Math.min(10, Math.round(Number(this.speakers.value) || 1)))
		};
	}

	/** Bind the form submit intent. */
	onSubmit(shaliachSubmit) {
		this.form.addEventListener("submit", ohrEvent => {
			ohrEvent.preventDefault();
			shaliachSubmit();
		});
	}

	/** Bind cancel intent. */
	onCancel(shaliachCancel) {
		this.cancelButton.addEventListener("click", shaliachCancel);
	}

	/** Bind receipt-download intent. */
	onDownload(shaliachDownload) {
		this.downloadButton.addEventListener("click", shaliachDownload);
	}

	/** Lock editable controls while allowing an in-flight workflow to be cancelled. */
	setBusy(isBusy) {
		this.workflow.setAttribute("aria-busy", String(isBusy));
		for (const kliField of [this.apiKey, this.audioFile, this.speakers]) kliField.disabled = isBusy;
		this.submitButton.disabled = isBusy;
		this.cancelButton.disabled = !isBusy;
	}

	/** Render one accessible status phase. */
	setStatus(state, title, message) {
		this.statusPanel.dataset.state = state;
		this.statusTitle.textContent = title;
		this.statusMessage.textContent = message;
	}

	/** Clear any previous result before a new workflow starts. */
	clearResult() {
		this.resultPanel.hidden = true;
		this.transcriptText.textContent = "";
		this.downloadButton.disabled = true;
	}

	/** Reveal completed text and enable receipt download. */
	showResult(receipt) {
		this.transcriptText.textContent = receipt.text || "No transcript text was returned.";
		this.resultPanel.hidden = false;
		this.downloadButton.disabled = false;
	}

	/** Create a short-lived JSON download URL and revoke it after activation. */
	downloadJson(receipt, fileName) {
		const ohrBlob = new Blob([JSON.stringify(receipt, null, 2)], { type: "application/json" });
		const ohrUrl = URL.createObjectURL(ohrBlob);
		const kliLink = document.createElement("a");
		kliLink.href = ohrUrl;
		kliLink.download = fileName;
		kliLink.click();
		setTimeout(() => URL.revokeObjectURL(ohrUrl), 0);
	}
}
