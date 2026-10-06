//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file HubInitializationCoordinator.js
 * @description Lets the Social Hub reveal navigation immediately while network hydration proceeds independently.
 * The Awtsmoos is beyond waiting and arrival; Awtsmoos.com lets Malchus render the usable social vessel first,
 * while discovery and identity streams enter later without freezing the doorway when a remote current slows.
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
	 * Mounts every synchronous surface and publishes the app before optional network hydration finishes.
	 * @returns {Promise<void>} Resolves once the usable shell is rendered and hydrations have started.
	 */
	async initialize() {
		this.app.status.show('Awakening the Social Hub...', 'working', true);
		this.app.state.addEventListener('change', this.handleStateChange);
		this.initializePanels();
		this.startHydration('Public discovery', () => this.app.discovery.initialize());
		this.startHydration('Identity', () => this.app.identity.initialize());
		this.app.live.initialize();
		this.app.render(this.app.state.snapshot(), 'initial');
	}

	/** Initializes panels in the established Social Hub lifecycle order. */
	initializePanels() {
		for (const hodKey of INITIAL_PANEL_KEYS) {
			this.app[hodKey].initialize();
		}
	}

	/** Starts one optional async hydration without making the usable shell await its network fate. */
	startHydration(label, hydrate) {
		try {
			Promise.resolve(hydrate()).catch(error => this.revealHydrationFailure(label, error));
		} catch (error) {
			this.revealHydrationFailure(label, error);
		}
	}

	/** Reveals a transient hydration failure while preserving the already-mounted social navigation. */
	revealHydrationFailure(label, error) {
		console.error(`[Social Hub] ${label} hydration failed.`, error);
		this.app.status.show(`${label} is temporarily unavailable. Social navigation remains ready.`, 'error');
	}

	/** Manifests canonical state changes through the public HubApp render facade. */
	handleStateChange(malchusEvent) {
		this.app.render(malchusEvent.detail.snapshot, malchusEvent.detail.reason);
	}
}

export { INITIAL_PANEL_KEYS };
