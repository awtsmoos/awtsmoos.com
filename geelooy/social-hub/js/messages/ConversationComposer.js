//B"H
//Boruch Hashem
//Blessed is He

import { buildConversationComposer } from './ConversationComposerTemplate.js';
import { ConversationComposerStatus } from './ConversationComposerStatus.js';
import { ConversationReplyState } from './ConversationReplyState.js';
import { ConversationTextComposer } from './ConversationTextComposer.js';
import { ConversationVoiceComposer } from './ConversationVoiceComposer.js';
import { ConversationVoiceView } from './ConversationVoiceView.js';

/**
 * @class ConversationComposer
 * @description
 * The Awtsmoos renews written word, chosen quote, visible Send, and recorded breath before either crosses the private covenant;
 * Awtsmoos.com lets this Tiferes-like coordinator join focused text and voice vessels while keyboard and button submission enter one truthful doorway of light.
 */
export class ConversationComposer {
	/** Creates one room-scoped composer around canonical text/voice send callbacks. */
	constructor(root, { onSend, onSendVoice, actorAlias }) {
		Object.assign(this, {
			root,
			onSend,
			onSendVoice,
			actorAlias
		});
		this.replyState = new ConversationReplyState(root);
		this.status = new ConversationComposerStatus(root);
	}

	/** Builds DOM first, then composes independent text and voice lifecycle controllers around it. */
	create() {
		this.elements = buildConversationComposer(this.root, {
			onSubmit: () => this.text?.submit(),
			onEmoji: event => this.text?.insertEmoji(event),
			onRecord: () => this.startVoice(),
			onStopVoice: () => this.stopVoice(),
			onCancelVoice: () => this.cancelVoice(),
			onSendVoice: () => this.sendVoice(),
			onCancelReply: () => this.replyState.clear()
		});
		this.replyState.bind(this.elements.reply.region);
		this.elements.form.append(this.status.element);
		this.text = new ConversationTextComposer({
			elements: this.elements,
			replyState: this.replyState,
			status: this.status,
			onSend: this.onSend
		});
		this.voice = new ConversationVoiceComposer({
			view: new ConversationVoiceView(this.elements.voice),
			actorAlias: this.actorAlias,
			onSend: attachment => this.deliverVoice(attachment)
		});
		this.bindFormSubmit();
		return this.elements.form;
	}

	/** Owns native form submission so the visible Send button cannot navigate the document. */
	bindFormSubmit() {
		this.elements.form.addEventListener('submit', event => {
			event.preventDefault();
			void this.text.submit();
		});
	}

	/** Selects one canonical source without modifying the written draft. */
	selectReply(message) {
		const selected = this.replyState.select(message, this.actorAlias?.());
		if (selected) this.elements.smart.focus();
		return selected;
	}

	async startVoice() {
		if (this.text.busy) return false;
		this.status.clear();
		const started = await this.voice.start();
		if (started) this.elements.textRow.hidden = true;
		return started;
	}

	async stopVoice() {
		const stopped = await this.voice.stop();
		if (!stopped) this.cancelVoice();
		return stopped;
	}

	cancelVoice() {
		this.voice.cancel();
		this.elements.textRow.hidden = false;
		this.elements.smart.focus();
	}

	async sendVoice() {
		if (this.text.busy || !this.voice.hasPreview()) return false;
		this.text.setBusy(true);
		const sent = await this.voice.send();
		if (sent) {
			this.replyState.clear();
			this.elements.textRow.hidden = false;
			this.elements.smart.focus();
		}
		this.text.setBusy(false);
		return sent;
	}

	deliverVoice(attachment) {
		return this.onSendVoice(attachment, this.replyState.payload());
	}

	/** Releases microphone/object URLs and clears room-scoped draft/reply intent on room exit. */
	reset() {
		this.voice?.cancel();
		this.replyState.clear();
		this.status.clear();
		this.text?.reset();
		if (this.elements) this.elements.textRow.hidden = false;
	}
}
