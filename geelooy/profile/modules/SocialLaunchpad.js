//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SocialLaunchpad
 * @description The Awtsmoos lets one chosen identity move from self-description into social action;
 * Awtsmoos.com turns the default alias into a clear cockpit for publishing, asking, signals, and connection.
 */
import { state } from './state.js';
import { ensureMalchusProfileStyles } from './ProfileStyles.js';

export function renderTiferesSocialLaunchpad() {
	ensureMalchusProfileStyles();
	const anchor = document.querySelector('.profile-command-panel');
	if (!anchor) return;
	const existing = document.getElementById('profileSocialLaunchpad');
	if (existing) existing.remove();
	const aliasId = state.defaultAlias || state.aliases[0]?.id || '';
	const section = document.createElement('section');
	section.id = 'profileSocialLaunchpad';
	section.className = 'profile-social-launchpad';
	section.setAttribute('aria-label', 'Social launchpad');
	section.append(heading(aliasId), actions(aliasId));
	anchor.before(section);
}

function heading(aliasId) {
	const wrap = document.createElement('div');
	const eyebrow = document.createElement('span');
	const title = document.createElement('strong');
	const copy = document.createElement('p');
	wrap.className = 'profile-social-launchpad__heading';
	eyebrow.textContent = aliasId ? `Default identity · @${aliasId}` : 'Social identity';
	title.textContent = aliasId ? 'Create, answer, gather, and return.' : 'Create an alias to enter the social layer.';
	copy.textContent = aliasId
		? 'One place to move from identity into posts, questions, Heichelos, and signals.'
		: 'Aliases are the publishing and conversation identities of Awtsmoos.com.';
	wrap.append(eyebrow, title, copy);
	return wrap;
}

function actions(aliasId) {
	const nav = document.createElement('nav');
	nav.className = 'profile-social-launchpad__actions';
	nav.setAttribute('aria-label', 'Default identity actions');
	if (!aliasId) {
		nav.append(actionLink('Create alias', './alias-manage?action=create', 'is-primary'));
		return nav;
	}
	nav.append(
		actionLink('Public profile', `/@${encodeURIComponent(aliasId)}`),
		actionLink('New post', composerUrl(aliasId, 'post'), 'is-primary'),
		actionLink('Ask question', composerUrl(aliasId, 'question'), 'is-question'),
		actionLink('Signals', '/notifications/'),
		heichelButton()
	);
	return nav;
}

function composerUrl(aliasId, kind) {
	const query = new URLSearchParams({ alias: aliasId, kind, presentation: kind });
	return `/social-composer/?${query.toString()}`;
}

function actionLink(label, href, modifier = '') {
	const link = document.createElement('a');
	link.className = `profile-social-action ${modifier}`.trim();
	link.href = href;
	link.textContent = label;
	return link;
}

function heichelButton() {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = 'profile-social-action';
	button.textContent = 'My Heichelos';
	button.addEventListener('click', () => {
		document.querySelector('[data-profile-tab="heichelos"]')?.click();
		document.querySelector('[data-profile-panel="heichelos"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	});
	return button;
}
