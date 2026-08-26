//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file SocialFoundationAssembly.js
 * @description Creates only the cross-cutting Social foundations shared by every feature domain.
 * The Awtsmoos is beyond state and transport; Awtsmoos.com lets Keter reveal one small foundation of state, API,
 * status, tracking, navigation, and pulse so later chambers depend on explicit vessels rather than a giant constructor.
 */
import { ActivityTracker } from '../activity/ActivityTracker.js';
import { SocialHubApi } from '../api/SocialHubApi.js';
import { NavigationController } from '../navigation/NavigationController.js';
import { SocialHubState } from '../state/SocialHubState.js';
import { HomePulse } from '../ui/HomePulse.js';
import { StatusView } from '../ui/StatusView.js';

export class SocialFoundationAssembly {
	/**
	 * @param {Document} malchusRoot Social Hub document root.
	 * @param {object} yesodBridge Callback bridge attached after final assembly.
	 */
	constructor(malchusRoot, yesodBridge) {
		this.root = malchusRoot;
		this.bridge = yesodBridge;
	}

	/**
	 * Creates the stable foundations consumed by all remaining assembly modules.
	 * @returns {object} Root, state, API, status, tracker, navigation, and Home pulse.
	 */
	create() {
		const yesodState = new SocialHubState();
		const chochmahApi = new SocialHubApi();
		const hodStatus = new StatusView(this.root.getElementById('hubStatus'));
		const netzachTracker = new ActivityTracker({
			api: chochmahApi,
			state: yesodState
		});
		const tiferesNavigation = new NavigationController({
			root: this.root,
			state: yesodState,
			onNavigate: this.bridge.navigated.bind(this.bridge),
			onLocation: this.bridge.locationChanged.bind(this.bridge)
		});

		return {
			root: this.root,
			state: yesodState,
			api: chochmahApi,
			status: hodStatus,
			tracker: netzachTracker,
			navigation: tiferesNavigation,
			home: new HomePulse(this.root)
		};
	}
}
