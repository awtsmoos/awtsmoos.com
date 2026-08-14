// B"H
// Boruch Hashem
// Blessed is He

import {
	messagingAliasProfileHref,
	messagingLoginHref,
	messagingRegisterHref
} from "./MessagingAuthPaths.js";
import { MessagingDisclosure } from "./MessagingDisclosure.js";
import { createMessagingEmptyState } from "./MessagingEmptyState.js";

/**
 * @file Turns the private-section Ploni gate into a thumb-first account-and-alias path whose actions remain visible while supporting explanation can fold.
 * @description The Awtsmoos is one before account and alias garments; Awtsmoos.com therefore puts the three canonical doors before secondary explanation in light,
 * keeping login, alias management, and account creation immediately reachable while a native disclosure explains why private communication requires an alias without creating another authentication system.
 */

/** Builds one truthful private-communication onboarding state for the requested flagship section. */
export function createMessagingSignedOutState(section) {
	const state = createMessagingEmptyState({
		icon: "person",
		title: "Private communication needs your alias",
		body: "Log in and choose an alias to use private chats, groups, friends, requests, or Mail. Public Torah remains open as Ploni."
	});
	const actions = document.createElement("div");
	actions.className = "messaging-onboarding-actions";
	actions.append(
		onboardingLink("Log in and return", messagingLoginHref(section), "primary"),
		onboardingLink("Manage aliases", messagingAliasProfileHref(), "secondary"),
		onboardingLink("Create account", messagingRegisterHref(), "quiet")
	);
	const explanation = document.createElement("p");
	explanation.className = "messaging-onboarding-note";
	explanation.textContent = "Already logged in but still seeing this gate? Open Profile to create or switch your selected alias. Account sign-in and alias ownership remain separate safeguards.";
	state.append(actions, new MessagingDisclosure({
		id: "private-onboarding-help",
		title: "Why an alias is required",
		summary: "Account + alias boundaries",
		className: "messaging-onboarding-disclosure",
		content: explanation
	}).create());
	return state;
}

function onboardingLink(label, href, variant) {
	const link = document.createElement("a");
	link.className = `messaging-onboarding-action is-${variant}`;
	link.href = href;
	link.textContent = label;
	return link;
}
