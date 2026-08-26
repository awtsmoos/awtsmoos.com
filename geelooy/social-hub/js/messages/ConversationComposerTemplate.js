//B"H
//Boruch Hashem
//Blessed is He

import { buildConversationVoiceRegion } from './ConversationComposerVoiceTemplate.js';
import { createIconButton } from '../ui/fields/IconButton.js';
import {
	composerAction,
	createSmartTextArea
} from '../ui/fields/SmartTextArea.js';

/**
 * @module ConversationComposerTemplate
 * @description
 * The Awtsmoos is beyond draft, reply, and audible breath, while Awtsmoos.com gives each composer mode a distinct visible keli;
 * this Malchus-like builder creates finite DOM only, leaving send truth, recorder life, and canonical protocol coordinates to neighboring vessels in light.
 */

/** Builds the compact Social private-message composer and returns focused element references. */
export function buildConversationComposer(document, handlers = {}) {
	const form = document.createElement('form');
	form.className = 'hubConversationComposer hubConversationComposer--rich';
	const reply = buildReplyStrip(document, handlers.onCancelReply);
	const smart = createSmartTextArea(document, {
		label: 'Private message',
		maxLength: 4000,
		placeholder: 'Message…',
		onSubmit: handlers.onSubmit,
		actions: [
			composerAction('emoji', 'Insert emoji', handlers.onEmoji)
		]
	});
	const mic = createIconButton(document, {
		action: 'mic',
		label: 'Record voice note',
		type: 'button',
		className: 'hubConversationComposer__mic'
	});
	mic.addEventListener('click', event => handlers.onRecord?.(event));
	const send = createIconButton(document, {
		action: 'send',
		label: 'Send message',
		type: 'submit',
		className: 'hubConversationComposer__send'
	});
	const textRow = document.createElement('div');
	textRow.className = 'hubConversationComposer__textRow';
	textRow.append(smart.element, mic, send);
	const hint = document.createElement('span');
	hint.className = 'hubConversationComposer__hint';
	hint.textContent = '↵ send · ⇧↵ line';
	const voice = buildConversationVoiceRegion(document, handlers);
	form.append(reply.region, textRow, hint, voice.region);
	return {
		form,
		smart,
		input: smart.textarea,
		send,
		mic,
		textRow,
		reply,
		voice
	};
}

/** Builds the compact quoted-message strip without owning reply state. */
function buildReplyStrip(document, onCancel) {
	const region = document.createElement('aside');
	region.className = 'hubConversationReplyComposer';
	region.hidden = true;
	const copy = document.createElement('div');
	const speaker = document.createElement('strong');
	speaker.dataset.replySpeaker = 'true';
	const preview = document.createElement('span');
	preview.dataset.replyPreview = 'true';
	preview.dir = 'auto';
	copy.append(speaker, preview);
	const cancel = document.createElement('button');
	cancel.type = 'button';
	cancel.className = 'hubConversationReplyCancel';
	cancel.setAttribute('aria-label', 'Cancel reply');
	cancel.textContent = '×';
	cancel.addEventListener('click', () => onCancel?.());
	region.append(copy, cancel);
	return { region, speaker, preview, cancel };
}
