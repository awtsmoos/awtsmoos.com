//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file SocialIdentityTransitionCoordinator.js
 * @description Synchronizes alias-scoped Social surfaces after IdentityController has already established verified identity truth.
 * The Awtsmoos is beyond self and transition; Awtsmoos.com lets Yesod advance one monotonic generation so older
 * orchestration completions cannot announce themselves after a newer alias has already become the visible vessel.
 */
const ACTIVE_ROUTE_REFRESH = Object.freeze({
	network: Object.freeze({ panel: 'network', withAlias: true }),
	spaces: Object.freeze({ panel: 'spaces', withAlias: false }),
	inbox: Object.freeze({ panel: 'inbox', withAlias: false }),
	messages: Object.freeze({ panel: 'messages', withAlias: false })
});

export class SocialIdentityTransitionCoordinator {
	/** @param {object} malchusApp Fully assembled HubApp facade. */
	constructor(malchusApp) {
		this.app = malchusApp;
		this.generation = 0;
	}

	/**
	 * Refreshes identity-sensitive surfaces while refusing stale post-refresh side effects.
	 * @param {string} yesodAliasId Newly verified alias chosen by IdentityController.
	 * @returns {Promise<boolean>} True only when this transition remains the newest generation at completion.
	 */
	async change(yesodAliasId) {
		if (!yesodAliasId) {
			return false;
		}
		const netzachGeneration = ++this.generation;
		this.manifestAliasContext(yesodAliasId);

		await Promise.all([
			this.app.activity.load(false),
			this.app.profile.load(false),
			this.app.discovery.load(this.app.discovery.mode)
		]);
		if (!this.isCurrent(netzachGeneration)) {
			return false;
		}

		await this.refreshActiveRoute(yesodAliasId);
		if (!this.isCurrent(netzachGeneration)) {
			return false;
		}

		this.app.live.sync();
		this.app.privacy.render(this.app.state.snapshot().preferences);
		this.app.status.show(
			'Identity synchronized. Available Social surfaces now follow the selected alias.',
			'success'
		);
		return true;
	}

	/** Writes legacy profile-target context required by creator/profile fields. */
	manifestAliasContext(yesodAliasId) {
		function manifestMalchusAlias(malchusState) {
			malchusState.profileAliasId = yesodAliasId;
		}

		this.app.state.mutate('identity:context', manifestMalchusAlias);
		this.app.root.getElementById('profileAliasId').value = yesodAliasId;
	}

	/** Refreshes only the currently visible identity-sensitive route. */
	async refreshActiveRoute(yesodAliasId) {
		const hodRouteId = this.app.state.snapshot().activeTab;
		const binahRule = ACTIVE_ROUTE_REFRESH[hodRouteId];
		if (!binahRule) {
			return;
		}
		const malchusPanel = this.app[binahRule.panel];
		if (binahRule.withAlias) {
			await malchusPanel.load(yesodAliasId);
			return;
		}
		await malchusPanel.load();
	}

	/** @returns {boolean} Whether one transition generation still owns post-refresh side effects. */
	isCurrent(netzachGeneration) {
		return netzachGeneration === this.generation;
	}
}

export { ACTIVE_ROUTE_REFRESH };
