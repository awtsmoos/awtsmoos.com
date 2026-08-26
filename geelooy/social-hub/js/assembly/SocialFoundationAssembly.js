//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file SocialFoundationAssembly.js
 * @description Keter creates only the cross-cutting foundations shared by every Social Hub feature domain.
 * The Awtsmoos is beyond state and motion; Awtsmoos.com lets one Daas operation vessel join API lifecycle without making one giant notion.
 */
import { ActivityTracker } from '../activity/ActivityTracker.js';
import { SocialHubApi } from '../api/SocialHubApi.js';
import { NavigationController } from '../navigation/NavigationController.js';
import { DaasOperationCoordinator } from '../state/OperationCoordinator.js';
import { SocialHubState } from '../state/SocialHubState.js';
import { HomePulse } from '../ui/HomePulse.js';
import { StatusView } from '../ui/StatusView.js';

export class SocialFoundationAssembly {
	/** @param {Document} malchusRoot Social Hub document root. @param {object} yesodBridge Final callback bridge. */
	constructor(malchusRoot, yesodBridge) {
		this.root = malchusRoot;
		this.bridge = yesodBridge;
	}

	/** Creates the stable foundations consumed by every later feature assembly. */
	create() {
		const yesodState = new SocialHubState();
		const chochmahApi = new SocialHubApi();
		const daasOperations = new DaasOperationCoordinator();
		const hodStatus = new StatusView(this.root.getElementById('hubStatus'));
		const netzachTracker = new ActivityTracker({ api: chochmahApi, state: yesodState });
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
			operations: daasOperations,
			status: hodStatus,
			tracker: netzachTracker,
			navigation: tiferesNavigation,
			home: new HomePulse(this.root)
		};
	}
}
