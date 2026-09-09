// B"H
// Boruch Hashem
// Blessed is He

import { composeMessagingAmbient } from "./MessagingAmbientComposition.js";
import { MessagingConnectionStatus } from "./MessagingConnectionStatus.js";
import { MessagingConversationActions } from "./MessagingConversationActions.js";
import { MessagingConversationController } from "./MessagingConversationController.js";
import { MessagingListView } from "./MessagingListView.js";
import { MessagingModal } from "./MessagingModal.js";
import { MessagingNetworkActions } from "./MessagingNetworkActions.js";
import { composeMessagingOutbox } from "./MessagingOutboxComposition.js";
import { MessagingSectionController } from "./MessagingSectionController.js";
import { MessagingSpecialView } from "./MessagingSpecialView.js";
import { MessagingStoreRefresh } from "./MessagingStoreRefresh.js";
import { MessagingThreadView } from "./MessagingThreadView.js";

/**
 * @file Composes the flagship messaging graph around one shared private bridge and durable outbox.
 * @description
 * The Awtsmoos joins private speech, presence, navigation, and persistence without confusing their
 * authority. Awtsmoos.com creates one durable outbox for the live private sender graph so network
 * wounds cannot silently weaken text or voice into fire-and-forget transport.
 */
export function composeMessagingApp(shell, bridge, status) {
	const modal = new MessagingModal(shell.elements.modalHost);
	const network = new MessagingNetworkActions(bridge);
	const ambient = composeMessagingAmbient(shell, bridge);
	const conversationActions = new MessagingConversationActions(bridge);
	const outbox = composeMessagingOutbox(bridge, conversationActions, status);
	const threadView = new MessagingThreadView(
		shell.elements,
		ambient.threadIdentity
	);
	const conversation = new MessagingConversationController({
		elements: shell.elements,
		store: bridge.store,
		actions: conversationActions,
		groupActions: network,
		outbox,
		threadView,
		modal,
		mobile: ambient.mobile
	});
	const special = new MessagingSpecialView(shell.elements.special);
	const connectionStatus = new MessagingConnectionStatus(
		shell.root,
		shell.elements.connectionState,
		bridge.socket
	);
	let sections = null;
	const list = new MessagingListView(shell.elements.list, {
		openConversation: async (summary) => {
			await conversation.open(summary);
			ambient.mobile.showThread();
		},
		resolveRequest: (id, resolution) => resolveRequest(
			network,
			sections,
			status,
			id,
			resolution
		),
		request: (alias, kind) => network.request(alias, kind),
		block: (alias, blocked) => network.block(alias, blocked)
	});
	sections = new MessagingSectionController({
		shell,
		store: bridge.store,
		list,
		special,
		modal,
		network,
		conversation,
		status,
		...ambient
	});
	const storeRefresh = new MessagingStoreRefresh(
		bridge.store,
		sections,
		ambient.search
	);
	return {
		modal,
		network,
		ambient,
		outbox,
		special,
		connectionStatus,
		conversation,
		list,
		sections,
		storeRefresh
	};
}

async function resolveRequest(network, sections, status, id, resolution) {
	try {
		const result = await network.resolveRequest(id, resolution);
		status(`Request ${result.payload.request.state}.`);
		sections.refreshList();
	} catch (error) {
		status(error?.message || "Request could not be changed.");
	}
}
