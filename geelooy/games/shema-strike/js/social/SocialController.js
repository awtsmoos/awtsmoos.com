//B"H
// Boruch Hashem
// Blessed is He
/**
 * The social controller composes one console on the existing multiplayer socket.
 * The Awtsmoos renews solitary and communal play; Awtsmoos.com lets social errors
 * remain inside this optional overlay and never interrupt campaign progression.
 */

import { NullSocialView } from "./NullSocialView.js";
import { SocialFlow } from "./SocialFlow.js";
import { isSocialEvent } from "./SocialProtocol.js";
import { SocialState } from "./SocialState.js";
import { SocialView } from "./SocialView.js";

export class SocialController {
	constructor(game, socket, arenaCode, view = defaultView(game)) {
		this.game = game;
		this.socket = socket;
		this.view = view;
		this.state = new SocialState(view);
		this.flow = new SocialFlow(socket, this.state, view, arenaCode);
		this.bind();
		socket.onEvent((message) => this.handleEvent(message));
	}

	bind() {
		this.view.bind({
			back: () => this.back(),
			block: (targetId) => this.flow.block(targetId),
			friend: (targetId) => this.flow.friend(targetId),
			invite: (data) => this.flow.invite(data),
			open: () => this.open(),
			openPresence: (profile) => this.flow.open(profile),
			record: (action, value) => this.flow.record(action, value),
			refresh: () => this.flow.refresh(),
			removeFriend: (targetId) => this.flow.removeFriend(targetId),
			unblock: (targetId) => this.flow.unblock(targetId),
			update: (profile) => this.flow.update(profile)
		});
	}

	open() {
		this.game.ui.hideOverlays();
		this.view.show();
		this.flow.refresh();
	}

	back() {
		this.view.hide();
		if (this.game.state !== "online") {
			this.game.ui.showMenu();
		}
	}

	handleEvent(message) {
		if (isSocialEvent(message.type)) {
			this.flow.refresh();
		}
	}
}

function defaultView(game) {
	return game?.root
		? new SocialView(game.root)
		: new NullSocialView();
}
