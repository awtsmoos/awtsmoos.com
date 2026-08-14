//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class ProfilePanel
 * @description
 * The Awtsmoos keeps one selected public alias synchronized across browser history, profile evidence,
 * relationship enrichment, and guarded follow state while Awtsmoos.com rejects stale asynchronous arrivals.
 */
import { profileRouteUrl } from '../navigation/RouteModel.js';
import { ProfileFollowController } from './ProfileFollowController.js';
import { ProfileRenderer } from './ProfileRenderer.js';

export class ProfilePanel {
	constructor({ root, api, state, status, navigation, onPromote }) {
		Object.assign(this, { root, api, state, status, navigation, onPromote });
		this.requestSequence = 0;
		this.renderer = new ProfileRenderer({
			root, state, onPromote,
			onOpenAlias: aliasId => void this.openAlias(aliasId, true)
		});
		this.follow = new ProfileFollowController({
			root, api, state, status,
			onChanged: () => this.load(false)
		});
	}

	initialize() {
		this.element('profileLoad').addEventListener('click', () => {
			void this.openAlias(this.element('profileAliasId').value.trim(), true);
		});
		this.element('profileAliasId').addEventListener('keydown', event => {
			if (event.key === 'Enter') void this.openAlias(event.currentTarget.value.trim(), true);
		});
	}

	async load(announce = false) {
		const snapshot = this.state.snapshot();
		const aliasId = this.element('profileAliasId').value.trim()
			|| snapshot.profileAliasId
			|| snapshot.identity.aliasId;
		if (!aliasId) return null;
		const requestId = ++this.requestSequence;
		if (announce) this.status.show('Tracing the profile constellation…', 'working');
		try {
			const [profile, livingCard] = await Promise.all([
				this.api.profile(aliasId),
				this.loadLivingCard(aliasId)
			]);
			if (requestId !== this.requestSequence) return null;
			this.state.mutate('profile:loaded', value => {
				value.profileAliasId = aliasId;
				value.profile = profile;
			});
			this.renderer.render(profile, livingCard);
			await this.follow.render(aliasId);
			if (announce) this.status.show('Profile constellation loaded.', 'success');
			return profile;
		} catch (error) {
			if (requestId === this.requestSequence) this.status.show(error.message, 'error');
			return null;
		}
	}

	async loadLivingCard(aliasId) {
		try {
			return await this.api.livingProfile(aliasId);
		} catch {
			return null;
		}
	}

	async openAlias(aliasId, writeHistory = true) {
		if (!aliasId) return null;
		const wasProfile = this.state.snapshot().activeTab === 'profile';
		this.rememberAlias(aliasId);
		if (writeHistory) this.writeProfileHistory(aliasId);
		this.navigation.activate('profile', false);
		return wasProfile ? this.load(true) : null;
	}

	async syncLocation(aliasId) {
		if (!aliasId) return null;
		const snapshot = this.state.snapshot();
		this.element('profileAliasId').value = aliasId;
		if (aliasId !== snapshot.profileAliasId) {
			this.rememberAlias(aliasId);
			return this.load(false);
		}
		if (!snapshot.profile) return this.load(false);
		return snapshot.profile;
	}

	rememberAlias(aliasId) {
		this.element('profileAliasId').value = aliasId;
		this.state.mutate('profile:selected', value => {
			const changed = value.profileAliasId !== aliasId;
			value.profileAliasId = aliasId;
			if (changed) value.profile = null;
		});
	}

	writeProfileHistory(aliasId) {
		const target = profileRouteUrl(aliasId, 'profile');
		const current = `${location.pathname}${location.search}${location.hash}`;
		if (current !== target) history.pushState(null, '', target);
	}

	render(profile, livingCard = null) {
		this.renderer.render(profile, livingCard);
	}

	element(id) {
		return this.root.getElementById(id);
	}
}
