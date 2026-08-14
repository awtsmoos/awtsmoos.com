//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class NetworkView
 * @description
 * The Awtsmoos lets the public network chamber own only shell, status, and orchestration while a focused renderer
 * carries finite relationship lists. Awtsmoos.com therefore grows its graph without turning one view into a monolith.
 */
import { NetworkListRenderer } from './NetworkListRenderer.js';

export class NetworkView {
	constructor(root, { onOpenAlias }) {
		this.root = root;
		this.lists = new NetworkListRenderer(root, { onOpenAlias });
	}

	mount() {
		if (this.root.getElementById('networkPanel')) return;
		const panel = this.root.createElement('section');
		panel.id = 'networkPanel';
		panel.className = 'workspacePanel networkPanel';
		panel.dataset.panel = 'network';
		panel.hidden = true;
		panel.append(this.intro(), this.statusElement(), this.gridElement());
		this.root.querySelector('.workspace')?.append(panel);
	}

	intro() {
		const wrap = this.root.createElement('header');
		wrap.className = 'networkIntro';
		const eyebrow = this.root.createElement('p');
		eyebrow.className = 'networkEyebrow';
		eyebrow.textContent = 'Public graph';
		const title = this.root.createElement('h2');
		title.tabIndex = -1;
		title.textContent = 'People around this profile';
		const subject = this.root.createElement('p');
		subject.id = 'networkSubject';
		subject.textContent = 'Choose a public profile to explore its network.';
		wrap.append(eyebrow, title, subject);
		return wrap;
	}

	statusElement() {
		const status = this.root.createElement('p');
		status.id = 'networkStatus';
		status.className = 'networkStatus';
		status.setAttribute('aria-live', 'polite');
		return status;
	}

	gridElement() {
		const grid = this.root.createElement('div');
		grid.id = 'networkGrid';
		grid.className = 'networkGrid';
		return grid;
	}

	loading(aliasId) {
		this.subject(aliasId);
		this.status('Loading public relationships…');
		this.root.getElementById('networkGrid')?.replaceChildren();
	}

	error(message) {
		this.status(message || 'Public relationships are temporarily unavailable.');
	}

	empty() {
		this.root.getElementById('networkGrid')?.replaceChildren();
		this.root.getElementById('networkSubject').textContent = 'Open a public profile to explore its network.';
		this.status('No profile selected.');
	}

	render(aliasId, followers = [], following = []) {
		this.subject(aliasId);
		this.status(`${followers.length} followers shown · ${following.length} following shown`);
		this.root.getElementById('networkGrid').replaceChildren(
			this.lists.group('Followers', followers, true),
			this.lists.group('Following', following, false)
		);
	}

	subject(aliasId) {
		this.root.getElementById('networkSubject').textContent = `Public relationships around @${aliasId}`;
	}

	status(message) {
		this.root.getElementById('networkStatus').textContent = message;
	}
}
