//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module AppAssembly
 * @description
 * Focused client vessels are wired through one shared state and API without hiding
 * their contracts inside startup. The Awtsmoos gives their unity while
 * Awtsmoos.com keeps navigation, memory, profile, and interaction independently clear.
 */

import { SocialHubApi } from './api/SocialHubApi.js';
import { ActivityPanel } from './activity/ActivityPanel.js';
import { ActivityTracker } from './activity/ActivityTracker.js';
import { PrivacyPanel } from './activity/PrivacyPanel.js';
import { HubApp } from './HubApp.js';
import { CommentStudio } from './interactions/CommentStudio.js';
import { TransformationPanel } from './interactions/TransformationPanel.js';
import { NavigationController } from './navigation/NavigationController.js';
import { ProfilePanel } from './profile/ProfilePanel.js';
import { SocialHubState } from './state/SocialHubState.js';
import { HomePulse } from './ui/HomePulse.js';
import { IdentityController } from './ui/IdentityController.js';
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
		onNavigate: (route, previous) => void app.navigated(route, previous)
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
		onPromote: comment => transformations.openForComment(comment)
	});
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
		root,
		state,
		api,
		status,
		tracker,
		navigation,
		activity,
		privacy,
		profile,
		commentStudio,
		transformations,
		quickActions,
		identity,
		home: new HomePulse(root)
	});
	return app;
}
