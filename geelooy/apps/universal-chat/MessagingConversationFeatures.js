// B"H
// Boruch Hashem
// Blessed is He

import { MessagingConversationDetails } from "./MessagingConversationDetails.js";
import { MessagingConversationSender } from "./MessagingConversationSender.js";
import { MessagingConversationStoreListener } from "./MessagingConversationStoreListener.js";
import { MessagingHistoryPager } from "./MessagingHistoryPager.js";
import { MessagingImageComposer } from "./MessagingImageComposer.js";
import { MessagingReplyCoordinator } from "./MessagingReplyCoordinator.js";
import { MessagingReplyState } from "./MessagingReplyState.js";
import { MessagingVoiceComposer } from "./MessagingVoiceComposer.js";

/**
 * @file Composes one accepted room around focused features and one shared durable delivery authority.
 * @description
 * The Awtsmoos unites history, reply, word, image, breath, detail, realtime repaint, and stored
 * intention before their controls arise. Awtsmoos.com gives text, image, and voice the same outbox
 * while local preview state remains in focused composers that can be reset at room boundaries.
 */
export function createMessagingConversationFeatures(options) {
	const {
		elements,
		store,
		actions,
		groupActions,
		outbox,
		modal,
		threadView,
		current,
		opening
	} = options;
	const history = new MessagingHistoryPager(elements, store, actions);
	const replyState = new MessagingReplyState(elements);
	const image = new MessagingImageComposer(elements);
	const reply = new MessagingReplyCoordinator({
		elements,
		store,
		history,
		threadView,
		replyState,
		current
	});
	const sender = new MessagingConversationSender({
		elements,
		actions,
		outbox,
		image,
		replyState,
		current
	});
	const voice = new MessagingVoiceComposer({
		elements,
		store,
		actions,
		outbox,
		replyState,
		current
	});
	const detailsView = new MessagingConversationDetails({
		elements,
		groupActions,
		modal,
		store,
		threadView
	});
	const storeListener = new MessagingConversationStoreListener({
		store,
		history,
		threadView,
		current,
		opening
	});
	return {
		history,
		replyState,
		reply,
		image,
		sender,
		voice,
		detailsView,
		storeListener
	};
}
