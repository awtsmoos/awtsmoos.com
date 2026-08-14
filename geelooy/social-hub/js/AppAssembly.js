//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module AppAssembly
 * @description
 * The Awtsmoos gathers Inbox, people, Spaces, discovery, profile, network, and private interaction through one shared state;
 * Awtsmoos.com keeps each chamber independently testable while browser history witnesses every route that fate has made.
 */
import { ActivityPanel } from './activity/ActivityPanel.js';
import { ActivityTracker } from './activity/ActivityTracker.js';
import { PrivacyPanel } from './activity/PrivacyPanel.js';
import { SocialHubApi } from './api/SocialHubApi.js';
import { HubApp } from './HubApp.js';
import { InboxPanel } from './inbox/InboxPanel.js';
import { CommentStudio } from './interactions/CommentStudio.js';
import { TransformationPanel } from './interactions/TransformationPanel.js';
import { NavigationController } from './navigation/NavigationController.js';
import { NetworkPanel } from './network/NetworkPanel.js';
import { PeoplePanel } from './people/PeoplePanel.js';
import { ProfilePanel } from './profile/ProfilePanel.js';
import { SpacesPanel } from './spaces/SpacesPanel.js';
import { SocialHubState } from './state/SocialHubState.js';
import { HomePulse } from './ui/HomePulse.js';
import { IdentityController } from './ui/IdentityController.js';
import { PublicDiscovery } from './ui/PublicDiscovery.js';
import { QuickActions } from './ui/QuickActions.js';
import { StatusView } from './ui/StatusView.js';

export function createSocialHub(root = document) {
	const state = new SocialHubState();
	const api = new SocialHubApi();
	const status = new StatusView(root.getElementById('hubStatus'));
	const tracker = new ActivityTracker({ api, state });
	let app;
	const navigation = new NavigationController({
		root,
		state,
		onNavigate: (route, previous) => void app.navigated(route, previous),
		onLocation: locationState => void app.locationChanged(locationState)
	});
	const activity = new ActivityPanel({ root, api, state, status });
	const privacy = new PrivacyPanel({
		root,
		api,
		state,
		status,
		onChanged: () => activity.render(state.snapshot().activity)
	});
	const transformations = new TransformationPanel({
		root,
		api,
		state,
		status,
		tracker,
		onPublished: () => void app.profile.load(false)
	});
	const profile = new ProfilePanel({
		root,
		api,
		state,
		status,
		navigation,
		onPromote: comment => transformations.openForComment(comment)
	});
	const network = new NetworkPanel({ root, api, state, profile });
	const people = new PeoplePanel({ root, api, profile });
	const discovery = new PublicDiscovery({ root, api, state, profile });
	const spaces = new SpacesPanel({ root, state, api, status });
	const inbox = new InboxPanel({ root, state, api });
	const commentStudio = new CommentStudio({
		root,
		api,
		state,
		status,
		tracker,
		onCreated: () => void profile.load(false)
	});
	const quickActions = new QuickActions({ root, state, tracker });
	const identity = new IdentityController({
		root,
		api,
		state,
		status,
		onChanged: aliasId => void app.identityChanged(aliasId)
	});
	app = new HubApp({
		root, state, api, status, tracker, navigation, activity, privacy,
		profile, network, people, discovery, spaces, inbox, commentStudio, transformations,
		quickActions, identity, home: new HomePulse(root)
	});
	return app;
}
