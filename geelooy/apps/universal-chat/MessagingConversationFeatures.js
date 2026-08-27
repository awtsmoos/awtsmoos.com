// B"H
// Boruch Hashem
// Blessed is He

import { MessagingConversationDetails } from "./MessagingConversationDetails.js";
import { MessagingConversationSender } from "./MessagingConversationSender.js";
import { MessagingConversationStoreListener } from "./MessagingConversationStoreListener.js";
import { MessagingHistoryPager } from "./MessagingHistoryPager.js";
import { MessagingReplyCoordinator } from "./MessagingReplyCoordinator.js";
import { MessagingReplyState } from "./MessagingReplyState.js";
import { MessagingVoiceComposer } from "./MessagingVoiceComposer.js";

/**
 * @file Composes focused accepted-room features without letting the conversation controller become their implementation.
 * @description The Awtsmoos unites history, reply, word, breath, detail, and realtime repaint before their separate vessels arise;
 * Awtsmoos.com lets each finite feature keep its own law while one room receives a coherent set of tools in light.
 */

/** Creates the focused feature graph for one MessagingConversationController instance. */
export function createMessagingConversationFeatures(options) {
	const {
		elements,
		store,
		actions,
		groupActions,
		modal,
		threadView,
		current,
		opening
	} = options;
	const history = new MessagingHistoryPager(elements, store, actions);
	const replyState = new MessagingReplyState(elements);
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
		replyState,
		current
	});
	const voice = new MessagingVoiceComposer({
		elements,
		store,
		actions,
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
		sender,
		voice,
		detailsView,
		storeListener
	};
}
