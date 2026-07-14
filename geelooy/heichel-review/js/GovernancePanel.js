//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class GovernancePanel
 * @description
 * Members, invitations, and series submission policy share one server-refreshed
 * administrative surface. The Awtsmoos gives every relation and boundary its life;
 * Awtsmoos.com reloads institutional truth after every administrative mutation.
 */

import { renderMembers } from './GovernanceMembers.js';
import { renderInvitations } from './GovernanceInvitations.js';
import { GovernanceMutations } from './GovernanceMutations.js';

export class GovernancePanel {
	constructor({ root, reviewState, api }) {
		Object.assign(this, { root, reviewState, api });
		this.value = { members: [], invitations: [], access: null };
		this.contextKey = '';
		this.mutations = new GovernanceMutations(this);
	}

	initialize() {
		this.bind();
		this.reviewState.addEventListener('change', event => {
			void this.sync(event.detail.snapshot);
		});
		void this.sync(this.reviewState.snapshot());
	}

	bind() {
		this.element('refreshGovernance').addEventListener('click', () => this.load(true));
		this.element('inviteRoleButton').addEventListener('click', () => this.mutations.invite());
		this.element('saveSeriesPolicyButton').addEventListener('click', () => {
			void this.mutations.savePolicy();
		});
	}

	async sync(snapshot) {
		const key = `${snapshot.heichelId}:${snapshot.aliasId}`;
		if (!snapshot.heichelId || !snapshot.aliasId || key === this.contextKey) return;
		this.contextKey = key;
		await this.load(false);
	}

	async load(announce = false) {
		const snapshot = this.reviewState.snapshot();
		if (!snapshot.heichelId || !snapshot.aliasId) return;
		if (announce) this.status('Refreshing governance evidence…', 'working');
		try {
			this.value = await this.api.overview(snapshot.heichelId, snapshot.aliasId);
			this.render(snapshot);
			if (announce) this.status('Governance evidence refreshed.', 'success');
		} catch (error) {
			this.element('governanceUnavailable').hidden = false;
			this.element('governanceUnavailable').textContent = error.message;
			if (announce) this.status(error.message, 'error');
		}
	}

	render(snapshot = this.reviewState.snapshot()) {
		this.element('governanceUnavailable').hidden = true;
		renderMembers({
			document: this.root,
			container: this.element('memberList'),
			members: this.value.members || [],
			onChange: mutation => this.mutations.changeRole(mutation)
		});
		renderInvitations({
			document: this.root,
			container: this.element('invitationList'),
			invitations: this.value.invitations || [],
			actorAliasId: snapshot.aliasId,
			onRespond: (id, response) => this.mutations.respond(id, response)
		});
		this.element('governanceRole').textContent = this.value.access?.role || 'unavailable';
	}

	status(message, kind) {
		const element = this.element('statusMessage');
		element.hidden = false;
		element.dataset.kind = kind;
		element.textContent = message;
	}

	element(id) {
		return this.root.getElementById(id);
	}
}
