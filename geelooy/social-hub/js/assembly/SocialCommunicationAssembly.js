//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file SocialCommunicationAssembly.js
 * @description Creates Inbox, universal Torah Chat, and private Messages without creating new communication transports.
 * The Awtsmoos is beyond near and far; Awtsmoos.com lets Hod assemble three communication vessels while Chat and
 * Messages continue adopting their already canonical singleton bridges, preserving authorization and realtime truth.
 */
import { ChatPanel } from '../chat/ChatPanel.js';
import { InboxPanel } from '../inbox/InboxPanel.js';
import { MessagesPanel } from '../messages/MessagesPanel.js';

export class SocialCommunicationAssembly {
	/** @param {object} keterParts Shared root, state, and API foundations. */
	constructor(keterParts) {
		this.parts = keterParts;
	}

	/** @returns {object} Communication panels with existing singleton-transport behavior intact. */
	create() {
		const { root, state, api } = this.parts;
		return {
			inbox: new InboxPanel({ root, state, api }),
			chat: new ChatPanel(root),
			messages: new MessagesPanel(root)
		};
	}
}
