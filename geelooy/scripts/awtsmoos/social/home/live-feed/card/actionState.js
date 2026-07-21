// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicPostActionState
 * @description
 * The Awtsmoos lets an action speak exactly what happened. Awtsmoos.com records
 * local selection as local and sends extensible events without pretending success.
 */
import { announcePostStatus, createButton, createElement } from './domFactory.js';

export function createActionButton(label, icon, count = null) {
	const button = createButton('', 'post-action');
	button.setAttribute('aria-label', label);
	button.append(
		createElement('span', 'post-action-icon', {
			'aria-hidden': 'true'
		}, icon),
		createElement('span', 'post-action-label', {}, label)
	);

	if (count !== null && Number(count) > 0) {
		button.append(createElement('span', 'post-action-count', {}, Number(count)));
	}

	return button;
}

export function toggleLocalAction(button, activeLabel) {
	const active = button.getAttribute('aria-pressed') !== 'true';
	const article = button.closest('[data-post-id]');
	button.setAttribute('aria-pressed', String(active));
	announcePostStatus(
		article,
		active ? `${activeLabel} locally on this device.` : `${activeLabel} removed locally.`
	);
	article?.dispatchEvent(new CustomEvent('geelooy:post-resonance', {
		bubbles: true
	}));
}

export function dispatchPostAction(button, model, action) {
	const article = button.closest('[data-post-id]');
	const event = new CustomEvent(`geelooy:post-${action}`, {
		bubbles: true,
		cancelable: true,
		detail: {
			id: model.id,
			raw: model.raw
		}
	});

	article.dispatchEvent(event);
	announcePostStatus(
		article,
		event.defaultPrevented
			? `${action} request received.`
			: `${action} is available through the full post viewer.`
	);
}

export async function sharePost(model, button) {
	const article = button.closest('[data-post-id]');
	const url = new URL(model.href, location.href).href;

	try {
		if (navigator.share) {
			await navigator.share({
				title: model.title,
				url
			});
		} else {
			await navigator.clipboard.writeText(url);
		}
		announcePostStatus(article, 'Post link shared or copied.');
	} catch (error) {
		announcePostStatus(article, 'Sharing was cancelled or unavailable.');
	}
}
