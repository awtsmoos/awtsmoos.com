// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AwtsmoosMailModals
 * @description
 * The Awtsmoos separates identity from composition: Awtsmoos.com presents one
 * calm entrance when identity is missing and one intentional writing vessel later.
 */
import { renderComposeModal } from './composeModal.js';
import { openMailContextMenu } from './contextMenu.js';
import { mountMailIdentitySummary } from './identitySummary.js';

export { renderComposeModal };

/** Renders the authentication gateway used only while Mail lacks an alias. */
export function renderLoginOverlay(ui, root) {
	ui.html({
		parent: root,
		tag: 'div',
		shaym: 'loginOverlay',
		classList: ['overlay', 'mail-auth-gateway'],
		attributes: {
			role: 'dialog',
			'aria-modal': 'true',
			'aria-labelledby': 'mail-identity-title'
		},
		children: [{
			tag: 'section',
			classList: ['modal-card', 'holo-border', 'identity-gateway-card'],
			children: [
				gatewayHero(),
				gatewayFeatures(),
				{
					tag: 'div',
					shaym: 'authWrapper',
					classList: ['identity-summary-mount', 'identity-gateway-account'],
					ready: createIdentityMountHandler()
				}
			]
		}]
	});
}

function createIdentityMountHandler() {
	return function mountIdentityGateway(element) {
		mountMailIdentitySummary(element, { prompt: true });
	};
}

function gatewayHero() {
	return {
		tag: 'header',
		classList: ['identity-gateway-hero'],
		children: [
			{ tag: 'span', classList: ['identity-gateway-mark'], attributes: { 'aria-hidden': 'true' }, textContent: '✦' },
			{
				tag: 'div',
				children: [
					{ tag: 'span', classList: ['compose-kicker'], textContent: 'Awtsmoos Mail' },
					{ tag: 'h2', attributes: { id: 'mail-identity-title' }, classList: ['modal-title'], textContent: 'Your communication center begins with identity' },
					{ tag: 'p', classList: ['identity-modal-copy'], textContent: 'Sign in or choose a Geelooy alias to open inboxes, sender categories, conversations, and composition.' }
				]
			}
		]
	};
}

function gatewayFeatures() {
	const featureData = [
		['Organized', 'Inbox, sent, drafts, requests, archive, and focused sender views.'],
		['Connected', 'One Geelooy identity follows conversations across the social experience.'],
		['Focused', 'Search, read, reply, and compose without burying the mailbox behind popups.']
	];
	const featureCards = [];
	for (const [title, copy] of featureData) {
		featureCards.push(gatewayFeature(title, copy));
	}
	return {
		tag: 'div',
		classList: ['identity-gateway-features'],
		children: featureCards
	};
}

function gatewayFeature(title, copy) {
	return {
		tag: 'article',
		classList: ['identity-gateway-feature'],
		children: [
			{ tag: 'strong', textContent: title },
			{ tag: 'span', textContent: copy }
		]
	};
}

/** Opens one contextual message-action menu. */
export function renderContextMenu(ui, x, y, message, row) {
	openMailContextMenu(x, y, message, row);
}
