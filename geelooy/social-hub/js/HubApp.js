//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class HubApp
 * @description
 * The Awtsmoos lets Inbox, Spaces, people, profile history, network traversal, and private instruments awaken in order;
 * Awtsmoos.com keeps app lifecycle small while route-specific loading flows through a separate Yesod coordinator.
 */
import { HubRouteCoordinator } from './navigation/HubRouteCoordinator.js';

export class HubApp {
	constructor(parts) {
		Object.assign(this, parts);
		this.routes = new HubRouteCoordinator(this);
	}

	async initialize() {
		this.status.show('Awakening the Social Hub…', 'working', true);
		this.state.addEventListener('change', event => {
			this.render(event.detail.snapshot, event.detail.reason);
		});
		this.initializePanels();
		await this.discovery.initialize();
		await this.identity.initialize();
		this.render(this.state.snapshot(), 'initial');
	}

	initializePanels() {
		this.people.initialize();
		this.network.initialize();
		this.profile.initialize();
		this.spaces.initialize();
		this.inbox.initialize();
		this.navigation.initialize();
		this.tracker.initialize();
		this.activity.initialize();
		this.privacy.initialize();
		this.commentStudio.initialize();
		this.transformations.initialize();
		this.quickActions.initialize();
	}

	async identityChanged(aliasId) {
		if (!aliasId) {
			return;
		}
		this.state.mutate('identity:context', value => {
			value.profileAliasId = aliasId;
		});
		this.root.getElementById('profileAliasId').value = aliasId;
		await Promise.all([
			this.activity.load(false),
			this.profile.load(false),
			this.discovery.load(this.discovery.mode)
		]);
		await this.refreshActiveIdentityRoute(aliasId);
		this.privacy.render(this.state.snapshot().preferences);
		this.status.show('Social graph, Inbox, Spaces, profile, and private ledger are ready.', 'success');
	}

	async refreshActiveIdentityRoute(aliasId) {
		const activeTab = this.state.snapshot().activeTab;
		if (activeTab === 'network') {
			await this.network.load(aliasId);
		}
		if (activeTab === 'spaces') {
			await this.spaces.load();
		}
		if (activeTab === 'inbox') {
			await this.inbox.load();
		}
	}

	render(snapshot, reason) {
		this.discovery.render(snapshot);
		this.home.render(snapshot);
		this.quickActions.render(snapshot);
		this.privacy.render(snapshot.preferences);
		this.renderContext(snapshot);
		if (reason === 'activity:loaded') {
			this.activity.render(snapshot.activity);
		}
	}

	renderContext(snapshot) {
		const target = snapshot.comment.target;
		this.root.getElementById('activeAliasBadge').textContent = snapshot.identity.aliasId
			? `@${snapshot.identity.aliasId}`
			: 'Public mode';
		this.root.getElementById('activeDestinationBadge').textContent = target.heichelId
			? `${target.heichelId}/${target.seriesId || 'root'}`
			: 'No destination';
		this.root.getElementById('activePrivacyBadge').textContent = snapshot.identity.aliasId
			? this.privateActivityLabel(snapshot)
			: 'Public discovery';
	}

	privateActivityLabel(snapshot) {
		if (snapshot.preferences?.enabled === false) {
			return 'Activity paused';
		}
		return `${snapshot.preferences?.defaultVisibility || 'private'} activity`;
	}

	navigated(route, previous) {
		return this.routes.navigated(route, previous);
	}

	locationChanged(locationState) {
		return this.routes.locationChanged(locationState);
	}
}
