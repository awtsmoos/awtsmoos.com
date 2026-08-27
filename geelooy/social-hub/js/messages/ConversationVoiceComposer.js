//B"H
//Boruch Hashem
//Blessed is He

import { MessagingAssetApi } from '../../../apps/universal-chat/MessagingAssetApi.js';
import { MessagingVoiceRecorder } from '../../../apps/universal-chat/MessagingVoiceRecorder.js';

/**
 * @class ConversationVoiceComposer
 * @description
 * The Awtsmoos is beyond breath, blob, alias, and delivery, while Awtsmoos.com lets one deliberate voice note pass through the already-proven asset covenant;
 * this Yesod-like controller owns microphone and local preview lifetime, but sends only the canonical asset id onward so client metadata never becomes trusted light.
 */
export class ConversationVoiceComposer {
	constructor({ view, actorAlias, onSend }) {
		this.view = view;
		this.actorAlias = actorAlias;
		this.onSend = onSend;
		this.recorder = new MessagingVoiceRecorder();
		this.assets = new MessagingAssetApi();
		this.preview = null;
		this.previewUrl = '';
	}

	/** Requests microphone access and begins one deliberate recording. */
	async start() {
		this.cancelPreview();
		try {
			await this.recorder.start();
			this.view.recording();
			return true;
		} catch (error) {
			this.view.error(
				error.message || 'Voice recording is unavailable.',
				false
			);
			return false;
		}
	}

	/** Stops active recording and reveals one unsent local File preview. */
	async stop() {
		try {
			this.preview = await this.recorder.stop();
			this.revokePreviewUrl();
			this.previewUrl = URL.createObjectURL(this.preview.file);
			this.view.preview(this.previewUrl, this.preview.durationMs);
			return true;
		} catch (error) {
			this.view.error(
				error.message || 'The recording could not be prepared.',
				false
			);
			return false;
		}
	}

	/** Cancels active recording and any unsent preview, releasing tracks and object URLs. */
	cancel() {
		this.recorder.cancel();
		this.cancelPreview();
		this.view.reset();
	}

	/** Uploads the local File, then sends only its canonical asset coordinate. */
	async send() {
		if (!this.preview?.file) return false;
		const aliasId = String(this.actorAlias?.() || '').trim();
		if (!aliasId) {
			this.view.error('Choose a verified alias before sending a voice note.');
			return false;
		}
		try {
			this.view.busy('Uploading voice note…');
			const manifest = await this.assets.uploadVoice(aliasId, this.preview.file);
			if (!manifest?.id) {
				throw new Error('Voice upload did not return an asset id.');
			}
			this.view.busy('Sending voice note…');
			await this.onSend?.({ assetId: manifest.id });
			this.cancel();
			return true;
		} catch (error) {
			this.view.error(error.message || 'Voice note was not sent. Try again.');
			return false;
		}
	}

	/** Reveals whether one local unsent recording is available for retry. */
	hasPreview() {
		return Boolean(this.preview?.file);
	}

	cancelPreview() {
		this.preview = null;
		this.revokePreviewUrl();
	}

	revokePreviewUrl() {
		if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
		this.previewUrl = '';
	}
}
