//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class HubApp
 * @description
 * The Awtsmoos lets durable panels, public Torah Chat, private Messages, creator doors, and one realtime witness awaken without letting ephemera seize the archive;
 * Awtsmoos.com keeps lifecycle small while route loading and live room truth flow through separate Yesod coordinators.
 */
import { HubRouteCoordinator } from './navigation/HubRouteCoordinator.js';
import { LiveCommunicationsCoordinator } from './realtime/LiveCommunicationsCoordinator.js';

export class HubApp {
	constructor(parts) {
		Object.assign(this, parts);
		this.routes = new HubRouteCoordinator(this);
		this.live = new LiveCommunicationsCoordinator(this);
	}

	async initialize() {
		this.status.show('Awakening the Social Hub...', 'working', true);
		this.state.addEventListener('change', event => {
			this.render(event.detail.snapshot, event.detail.reason);
		});
		this.initializePanels();
		await this.discovery.initialize();
		await this.identity.initialize();
		this.live.initialize();
		this.render(this.state.snapshot(), 'initial');
	}

	initializePanels() {
		const panels = [
			this.people,
			this.network,
			this.profile,
			this.spaces,
			this.inbox,
			this.chat,
			this.messages,
			this.navigation,
			this.tracker,
			this.activity,
			this.privacy,
			this.creatorLaunch,
			this.commentStudio,
			this.transformations,
			this.quickActions
		];
		for (const panel of panels) panel.initialize();
	}

	async identityChanged(aliasId) {
		if (!aliasId) return;
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
		this.live.sync();
		this.privacy.render(this.state.snapshot().preferences);
		this.status.show(
			'Social graph, Inbox, Chat, Messages, Spaces, live presence, profile, and private ledger are ready.',
			'success'
		);
	}

	async refreshActiveIdentityRoute(aliasId) {
		const activeTab = this.state.snapshot().activeTab;
		if (activeTab === 'network') await this.network.load(aliasId);
		if (activeTab === 'spaces') await this.spaces.load();
		if (activeTab === 'inbox') await this.inbox.load();
		if (activeTab === 'messages') await this.messages.load();
	}

	render(snapshot, reason) {
		this.discovery.render(snapshot);
		this.home.render(snapshot);
		this.quickActions.render(snapshot);
		this.creatorLaunch.render(snapshot);
		this.privacy.render(snapshot.preferences);
		this.renderContext(snapshot);
		if (reason === 'activity:loaded') this.activity.render(snapshot.activity);
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
		if (snapshot.preferences?.enabled === false) return 'Activity paused';
		return `${snapshot.preferences?.defaultVisibility || 'private'} activity`;
	}

	async navigated(route, previous) {
		await this.routes.navigated(route, previous);
		this.live.sync();
	}

	async locationChanged(locationState) {
		await this.routes.locationChanged(locationState);
		this.live.sync();
	}
}
