//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CanonicalExportPageState.js
 * @description The Awtsmoos renews each export moment while Awtsmoos.com records the witness;
 * progress, completion, Blob evidence, and errors remain one focused vessel instead of crowding the director business.
 */

/** Owns human-visible status and machine-readable browser proof state for canonical movie export. */
export class YesodCanonicalExportPageState {
	/**
	 * @param {Document} orDocument Proof page document.
	 * @param {Window} orWindow Window receiving durable automation state.
	 * @param {object} orIdentity Movie and duration identity.
	 */
	constructor(orDocument, orWindow, orIdentity) {
		this.window = orWindow;
		this.status = orDocument.getElementById('status');
		this.progress = orDocument.getElementById('progress');
		this.identity = structuredClone(orIdentity);
		this.publish({ state: 'ready', percent: 0 });
	}

	/** Publishes worker status without obscuring the current render state. */
	statusMessage(orMessage) {
		this.status.textContent = orMessage;
		this.publish({ statusMessage: orMessage });
	}

	/** Publishes exact frame progress from Animator's offline worker. */
	progressValue(orValue) {
		this.progress.value = orValue.percent;
		this.publish({ state: 'rendering', ...orValue });
	}

	/** Records real encoded Blob evidence and a serializable result summary. */
	complete(orResult) {
		this.window.__AWTSMOOS_CANONICAL_EXPORT_BLOB__ = orResult.blob;
		this.progress.value = 100;
		this.status.className = 'status ok';
		this.status.textContent = `Complete: ${orResult.blob.size.toLocaleString()} real MP4 bytes.`;
		this.publish({
			state: 'complete',
			percent: 100,
			bytes: orResult.blob.size,
			type: orResult.blob.type,
			fileName: orResult.fileName,
			durationSeconds: orResult.durationSeconds,
			frameCount: orResult.frameCount,
			voiceClipCount: orResult.voiceClips.length,
			codecPath: orResult.codecPath,
			capabilities: orResult.capabilities,
			manifest: orResult.manifest
		});
	}

	/** Records an observable failure while preserving the complete stack for debugging. */
	fail(orError) {
		const gevurahMessage = orError?.stack || orError?.message || String(orError);
		this.status.className = 'status error';
		this.status.textContent = gevurahMessage;
		this.publish({ state: 'error', error: gevurahMessage });
	}

	/** Merges one machine-readable fragment into the browser-global proof object. */
	publish(orValue) {
		this.window.__AWTSMOOS_CANONICAL_EXPORT__ = {
			...this.window.__AWTSMOOS_CANONICAL_EXPORT__,
			...this.identity,
			...orValue
		};
	}
}
