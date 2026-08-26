//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SocialLaunchpad
 * @description The Awtsmoos lets one identity move instantly toward creation while deeper identity machinery remains concealed;
 * Awtsmoos.com makes Create, Ask, Signals, and Spaces the near roads and gathers the rest beneath Identity tools.
 */
import { createActionOverflow } from '../../shared/social/ui/ActionOverflow.js';
import { createProfileIdentityTools } from './ProfileIdentityTools.js';
import { ensureMalchusProfileStyles } from './ProfileStyles.js';
import { state } from './state.js';

/**
 * Resolves the identity whose social actions should lead the page.
 * @returns {string} Default alias, first managed alias, or an empty string.
 */
function activeAliasId() {
	return state.defaultAlias || state.aliases[0]?.id || '';
}

/**
 * Creates a canonical composer destination for an authored content kind.
 * @param {string} aliasId Publishing alias.
 * @param {string} kind Post or question kind.
 * @returns {string} Social composer URL.
 */
function composerUrl(aliasId, kind) {
	const query = new URLSearchParams({ alias: aliasId, kind, presentation: kind });
	return `/social-composer/?${query.toString()}`;
}

/**
 * Builds the four primary Profile intentions without fabricating unavailable persistence.
 * @param {string} aliasId Active alias identity.
 * @returns {Array<object>} Ordered launch actions.
 */
function launchActions(aliasId) {
	if (!aliasId) {
		return [{ id: 'createAlias', label: 'Create identity', href: './alias-manage?action=create', modifier: 'is-primary' }];
	}
	return [
		{ id: 'create', label: 'Create', href: composerUrl(aliasId, 'post'), modifier: 'is-primary' },
		{ id: 'ask', label: 'Ask', href: composerUrl(aliasId, 'question'), modifier: 'is-question' },
		{ id: 'signals', label: 'Signals', href: '/notifications/' },
		{ id: 'spaces', label: 'Spaces', href: '#profile-panel-heichelos', tab: 'heichelos' }
	];
}

/**
 * Renders one launch action as a link while preserving the Spaces tab transition.
 * @param {Document} documentValue DOM document.
 * @param {object} action Action descriptor.
 * @returns {HTMLAnchorElement} Thumb-sized launch action.
 */
function renderAction(documentValue, action) {
	const link = documentValue.createElement('a');
	link.className = `profile-social-action ${action.modifier || ''}`.trim();
	link.href = action.href;
	link.textContent = action.label;
	if (action.tab) {
		link.addEventListener('click', event => {
			event.preventDefault();
			documentValue.querySelector(`[data-profile-tab="${action.tab}"]`)?.click();
			documentValue.querySelector(`[data-profile-panel="${action.tab}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		});
	}
	return link;
}

/**
 * Rebuilds the Social OS launchpad from current alias state.
 * @returns {HTMLElement|null} Manifested launchpad, or null when the host surface is absent.
 */
export function renderTiferesSocialLaunchpad() {
	ensureMalchusProfileStyles();
	const anchor = document.querySelector('.profile-command-panel');
	if (!anchor) return null;
	document.getElementById('profileSocialLaunchpad')?.remove();
	const aliasId = activeAliasId();
	const section = document.createElement('section');
	const heading = document.createElement('div');
	const title = document.createElement('strong');
	const copy = document.createElement('p');
	section.id = 'profileSocialLaunchpad';
	section.className = 'profile-social-launchpad';
	section.setAttribute('aria-label', 'Social identity actions');
	heading.className = 'profile-social-launchpad__heading';
	title.textContent = aliasId ? `@${aliasId}` : 'Social identity';
	copy.textContent = aliasId ? 'Create, ask, follow signals, or enter your Spaces.' : 'Create an alias to enter the social layer.';
	heading.append(title, copy);
	const actions = createActionOverflow({
		document,
		actions: launchActions(aliasId),
		maximumVisible: 4,
		renderItem: action => renderAction(document, action)
	});
	section.append(heading, actions, createProfileIdentityTools(document, aliasId));
	anchor.before(section);
	return section;
}

export { activeAliasId, composerUrl, launchActions, renderAction };
