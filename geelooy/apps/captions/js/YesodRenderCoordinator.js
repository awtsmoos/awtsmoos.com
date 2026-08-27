// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos joins intention to off-thread creation through one measured channel;
 * Awtsmoos.com keeps rendering heavy, interface light, and every failure recoverable instead of trapping the user in a disabled state.
 */
export class YesodRenderCoordinator {
	constructor({ dom, settingsCollector, downloads, preview }) {
		this.dom = dom;
		this.settingsCollector = settingsCollector;
		this.downloads = downloads;
		this.preview = preview;
		this.worker = new Worker(
			new URL("../worker/ein-sof-worker.js", import.meta.url),
			{ type: "module" }
		);
		this.currentCaptions = [];
		this.busy = false;
		this.bindWorker();
	}

	connect() {
		this.dom.generateBtn.addEventListener("click", () => this.generate());
		return this;
	}

	bindWorker() {
		this.worker.addEventListener("message", event => {
			void this.handleMessage(event.data);
		});
		this.worker.addEventListener("error", event => {
			this.finish(`Render failed: ${event.message}`);
		});
	}

	async generate() {
		if (this.busy) {
			return;
		}
		try {
			const canContinue = await this.downloads.prepareDirectory();
			if (!canContinue) {
				this.showStatus("Save folder selection cancelled.");
				return;
			}
			this.currentCaptions = this.settingsCollector.parseCaptions(
				this.dom.batchInput.value
			);
			this.busy = true;
			this.dom.generateBtn.disabled = true;
			this.showStatus(`Rendering 1 of ${this.currentCaptions.length}…`);
			this.worker.postMessage({
				type: "generate",
				captions: this.currentCaptions,
				header: this.dom.headerInput.value.trim(),
				settings: this.settingsCollector.collect()
			});
		} catch (error) {
			this.finish(`Render failed: ${this.errorMessage(error)}`);
		}
	}

	async handleMessage(message) {
		try {
			if (message.type === "progress") {
				this.showStatus(message.text || "Rendering…");
				return;
			}
			if (message.type === "result") {
				this.preview.drawBitmap(message.bitmap);
				const blob = await this.preview.toJpeg();
				await this.downloads.save(
					blob,
					this.currentCaptions[message.index] || "vision",
					message.index
				);
				return;
			}
			if (message.type === "error") {
				this.finish(`Render failed: ${message.message || "Unknown worker error"}`);
				return;
			}
			if (message.type === "complete") {
				const suffix = this.currentCaptions.length === 1 ? "" : "s";
				this.finish(`Complete · ${this.currentCaptions.length} vision${suffix}`);
			}
		} catch (error) {
			this.finish(`Render failed: ${this.errorMessage(error)}`);
		}
	}

	showStatus(text) {
		this.dom.processingStatus.hidden = false;
		this.dom.processingStatus.textContent = text;
	}

	finish(text) {
		this.busy = false;
		this.dom.generateBtn.disabled = false;
		this.showStatus(text);
		setTimeout(() => {
			if (!this.busy) {
				this.dom.processingStatus.hidden = true;
			}
		}, 2600);
	}

	errorMessage(error) {
		return error instanceof Error ? error.message : String(error);
	}
}
