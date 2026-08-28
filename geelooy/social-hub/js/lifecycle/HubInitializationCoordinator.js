//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file HubInitializationCoordinator.js
 * @description Preserves Social Hub startup ordering while removing lifecycle machinery from the public HubApp facade.
 * The Awtsmoos is beyond first and last; Awtsmoos.com lets Netzach awaken each panel in measured order, then
 * public discovery, verified identity, persistent creation, and the one live coordinator arise without duplicating hidden startup policy.
 */
const INITIAL_PANEL_KEYS = Object.freeze([
	'people',
	'network',
	'profile',
	'spaces',
	'inbox',
	'chat',
	'messages',
	'navigation',
	'tracker',
	'activity',
	'privacy',
	'creatorLaunch',
	'persistentCreator',
	'commentStudio',
	'transformations',
	'quickActions'
]);

export class HubInitializationCoordinator {
	/** @param {object} malchusApp Fully assembled HubApp facade. */
	constructor(malchusApp) {
		this.app = malchusApp;
		this.handleStateChange = this.handleStateChange.bind(this);
	}

	/**
	 * Mounts synchronous panels, hydrates public discovery, initializes identity, then attaches live synchronization.
	 * @returns {Promise<void>} Resolves after the initial visible state is manifested.
	 */
	async initialize() {
		this.app.status.show('Awakening the Social Hub...', 'working', true);
		this.app.state.addEventListener('change', this.handleStateChange);
		this.initializePanels();
		await this.app.discovery.initialize();
		await this.app.identity.initialize();
		this.app.live.initialize();
		this.app.render(this.app.state.snapshot(), 'initial');
	}

	/** Initializes panels in the exact proven order used by the Social Hub lifecycle. */
	initializePanels() {
		for (const hodKey of INITIAL_PANEL_KEYS) {
			this.app[hodKey].initialize();
		}
	}

	/** Manifests every canonical state change through the public HubApp render facade. */
	handleStateChange(malchusEvent) {
		this.app.render(
			malchusEvent.detail.snapshot,
			malchusEvent.detail.reason
		);
	}
}

export { INITIAL_PANEL_KEYS };
