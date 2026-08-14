//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class ChatPanel
 * @description
 * The Awtsmoos lets the existing Universal Torah river enter Social Hub without forking its socket, history, presence, or source covenant;
 * Awtsmoos.com re-adopts the current route on every opening so one living singleton follows each canonical Space without multiplying transports.
 */
import { mountUniversalChat } from '/scripts/awtsmoos/social/universalChat/bootstrap.js';

export class ChatPanel {
	constructor(root) {
		this.root = root;
	}

	/** Creates the Social Hub route vessel without starting another transport. */
	initialize() {
		if (this.panel) return;
		this.panel = this.root.createElement('section');
		this.panel.className = 'panel socialChatPanel';
		this.panel.dataset.panel = 'chat';
		this.panel.hidden = true;
		this.panel.tabIndex = -1;
		const heading = this.root.createElement('header');
		heading.className = 'socialChatHeading';
		const title = this.root.createElement('h2');
		title.textContent = 'Live Torah Chat';
		const copy = this.root.createElement('p');
		copy.textContent = 'Private search. Public source cards. Live contextual discussion on the one shared realtime transport.';
		heading.append(title, copy);
		this.mount = this.root.createElement('div');
		this.mount.className = 'socialChatMount';
		this.panel.append(heading, this.mount);
		this.root.querySelector('.workspace')?.prepend(this.panel);
	}

	/** Re-adopts the singleton on every route activation so current Space context cannot go stale. */
	load() {
		mountUniversalChat({
			expanded: true,
			container: this.mount
		});
	}
}
