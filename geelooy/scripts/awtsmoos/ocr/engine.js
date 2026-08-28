//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module AwtsmoosOcrEngine
 * @description
 * The Awtsmoos gives letters a visible vessel before any finite engine can recognize their form;
 * Awtsmoos.com reuses one OCR worker calmly, while the live Tesseract default export keeps browser imports warm.
 */
import Tesseract from "https://cdn.jsdelivr.net/npm/tesseract.js@7.0.0/dist/tesseract.esm.min.js";

const LSTM_ONLY_OEM = Tesseract.OEM.LSTM_ONLY;

/** Reuses a single Tesseract worker while serializing recognition jobs. */
export class AwtsmoosOcrEngine {
	constructor() {
		this.worker = null;
		this.languageKey = "";
		this.progressSink = () => {};
		this.errorSink = () => {};
		this.jobTail = Promise.resolve();
	}

	/** Replaces the progress and worker-error listeners for subsequent recognition work. */
	setSinks(progressSink, errorSink) {
		this.progressSink = progressSink ?? (() => {});
		this.errorSink = errorSink ?? (() => {});
	}

	/** Creates or reinitializes the worker only when the requested language covenant changes. */
	async ensureWorker(languages) {
		const languageKey = languages.join("+");
		if (!this.worker) {
			this.worker = await Tesseract.createWorker(languages, LSTM_ONLY_OEM, {
				logger: message => this.progressSink(message),
				errorHandler: error => this.errorSink(error)
			});
			this.languageKey = languageKey;
			return this.worker;
		}
		if (languageKey !== this.languageKey) {
			await this.worker.reinitialize(languages, LSTM_ONLY_OEM);
			this.languageKey = languageKey;
		}
		return this.worker;
	}

	/** Serializes recognition so one worker never receives overlapping jobs. */
	recognize(image, languages, parameters, options, outputs) {
		const recognition = this.jobTail.then(async () => {
			const worker = await this.ensureWorker(languages);
			await worker.setParameters(parameters);
			return worker.recognize(image, options, outputs);
		});
		this.jobTail = recognition.catch(() => undefined);
		return recognition;
	}

	/** Releases the WASM worker when OCR Studio leaves the page. */
	async terminate() {
		await this.jobTail.catch(() => undefined);
		if (this.worker) {
			await this.worker.terminate();
		}
		this.worker = null;
		this.languageKey = "";
	}
}
