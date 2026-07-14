//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class HubApp
 * @description
 * Identity, navigation, private activity, profile evidence, exact interactions,
 * transformations, quick actions, and pulse gather without becoming one monolith.
 * The Awtsmoos gives their unity while Awtsmoos.com keeps each vessel testable.
 */

export class HubApp {
	constructor(parts) {
		Object.assign(this, parts);
	}

	async initialize() {
		this.status.show('Awakening the Social Hub…', 'working', true);
		this.state.addEventListener('change', event => {
			this.render(event.detail.snapshot, event.detail.reason);
		});
		this.navigation.initialize();
		this.tracker.initialize();
		this.activity.initialize();
		this.privacy.initialize();
		this.profile.initialize();
		this.commentStudio.initialize();
		this.transformations.initialize();
		this.quickActions.initialize();
		await this.identity.initialize();
		this.render(this.state.snapshot(), 'initial');
	}

	async identityChanged(aliasId) {
		if (!aliasId) return;
		this.state.mutate('identity:context', value => {
			value.profileAliasId = aliasId;
		});
		this.root.getElementById('profileAliasId').value = aliasId;
		await Promise.all([
			this.activity.load(false),
			this.profile.load(false)
		]);
		this.privacy.render(this.state.snapshot().preferences);
		this.status.show('Social graph, profile, and private ledger are ready.', 'success');
	}

	render(snapshot, reason) {
		this.home.render(snapshot);
		this.quickActions.render(snapshot);
		this.privacy.render(snapshot.preferences);
		this.renderContext(snapshot);
		if (reason === 'activity:loaded') this.activity.render(snapshot.activity);
	}

	renderContext(snapshot) {
		const target = snapshot.comment.target;
		this.root.getElementById('activeAliasBadge').textContent = snapshot.identity.aliasId
			? `@${snapshot.identity.aliasId}`
			: 'No alias';
		this.root.getElementById('activeDestinationBadge').textContent = target.heichelId
			? `${target.heichelId}/${target.seriesId || 'root'}`
			: 'No destination';
		this.root.getElementById('activePrivacyBadge').textContent = snapshot.preferences?.enabled === false
			? 'Activity paused'
			: `${snapshot.preferences?.defaultVisibility || 'private'} activity`;
	}

	async navigated(route, previous) {
		await this.tracker.navigate(route, previous);
		if (route.id === 'activity') await this.activity.load(false);
		if (['profile', 'references'].includes(route.id)) await this.profile.load(false);
	}
}
