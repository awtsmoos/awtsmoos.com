// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicPostIdentity
 * @description
 * The Awtsmoos gives each voice a visible vessel and refuses counterfeit honor.
 * Awtsmoos.com shows verification and role only when the real object supplies them.
 */
import { createElement, createLink } from './domFactory.js';

/**
 * Renders avatar, profile identity, role, time, and visibility.
 *
 * @param {object} model - Normalized post model.
 * @returns {HTMLElement} Identity header.
 */
export function renderPostIdentity(model) {
	const header = createElement('header', 'post-identity');
	const avatar = renderAvatar(model);
	const copy = createElement('div', 'post-identity-copy');
	const nameRow = createElement('div', 'post-identity-name-row');
	const name = model.alias
		? createLink(model.authorName, `/profile/${encodeURIComponent(model.alias)}`, 'post-author-link')
		: createElement('strong', 'post-author-name', {}, model.authorName);

	nameRow.append(name);

	if (model.verified) {
		nameRow.append(createElement('span', 'post-role-badge', {
			title: 'Verified identity'
		}, 'Verified'));
	}

	if (model.role) {
		nameRow.append(createElement('span', 'post-role-badge', {}, model.role));
	}

	copy.append(nameRow, renderMetadata(model));
	header.append(avatar, copy);
	return header;
}

function renderAvatar(model) {
	const vessel = createElement('span', 'post-avatar-vessel', {
		'aria-hidden': 'true'
	});

	if (model.avatar) {
		const image = createElement('img', 'post-avatar-image', {
			src: model.avatar,
			alt: '',
			loading: 'lazy',
			decoding: 'async'
		});

		image.addEventListener('error', () => {
			image.remove();
			vessel.textContent = initials(model.authorName);
		});

		vessel.append(image);
	} else {
		vessel.textContent = initials(model.authorName);
	}

	return vessel;
}

function renderMetadata(model) {
	const row = createElement('div', 'post-identity-meta');
	const values = [];

	if (model.alias) {
		values.push(`@${model.alias}`);
	}

	if (model.timestamp) {
		values.push(formatTimestamp(model.timestamp));
	}

	if (model.visibility) {
		values.push(model.visibility);
	}

	values.forEach(value => {
		row.append(createElement('span', '', {}, value));
	});

	return row;
}

function initials(name) {
	return String(name || 'G')
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map(part => part[0]?.toUpperCase())
		.join('');
}

function formatTimestamp(value) {
	const date = new Date(value);

	if (Number.isNaN(date.getTime())) {
		return String(value);
	}

	return new Intl.DateTimeFormat(undefined, {
		dateStyle: 'medium',
		timeStyle: 'short'
	}).format(date);
}
