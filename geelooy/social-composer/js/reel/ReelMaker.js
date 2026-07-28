// B"H
// Boruch Hashem
// Blessed is He

/**
 * @class ReelMaker
 * @description
 * Upload and world-generated cinema enter one guarded social workflow. The
 * Awtsmoos joins creator intention with a real video attachment; Awtsmoos.com
 * loads MitzvahWorld only on demand and never shares its gameplay loop.
 */

import { bindReelMaker } from './ReelMakerEvents.js';
import { createReelMakerView } from './ReelMakerView.js';
import { attachUploadedReel } from './ReelUpload.js';

export class ReelMaker {
	constructor({ root = document, mediaActions, status }) {
		Object.assign(this, { root, mediaActions, status });
		this.view = createReelMakerView(root);
		this.busy = false;
		this.studioApi = null;
		bindReelMaker(this);
	}

	open(invoker = this.view.open) {
		this.invoker = invoker;
		this.showChoice();
		if (!this.view.dialog.open) this.view.dialog.showModal();
		requestAnimationFrame(() => this.view.create.focus());
	}

	showChoice() {
		if (this.busy) return;
		this.view.choice.hidden = false;
		this.view.studio.hidden = true;
		this.view.back.hidden = true;
		this.view.status.textContent = 'Preparing studio…';
		this.view.progress.value = 0;
		this.unloadStudio();
	}

	handleUpload() {
		try {
			const attachment = attachUploadedReel(
				this.view.upload.files,
				this.mediaActions
			);
			this.finishAttachment(attachment, 'Video reel attached.');
		} catch (error) {
			this.status.show(error.message, 'error');
		} finally {
			this.view.upload.value = '';
		}
	}

	finishAttachment(attachment, message) {
		this.status.show(message, 'success');
		this.view.status.textContent = message;
		this.revealRootMedia();
		this.view.dialog.close();
		return attachment;
	}

	setBusy(value) {
		this.busy = value;
		this.view.render.disabled = value || !this.studioApi;
		this.view.close.disabled = value;
		this.view.back.disabled = value;
	}

	unloadStudio() {
		this.frame?.remove();
		this.frame = null;
		this.studioApi = null;
	}

	revealRootMedia() {
		const panel = this.root.getElementById('rootMedia')?.closest('details');
		if (!panel) return;
		panel.open = true;
		panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
	}
}
