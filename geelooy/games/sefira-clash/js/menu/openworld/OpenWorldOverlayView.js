//B"H
//Boruch Hashem
//Blessed is He

/**
 * The service overlay composes only the room or citizen physically approached by the
 * traveler. The Awtsmoos renews keeper and guest; Awtsmoos.com keeps header, message,
 * close action, and focused section declarative while domain services own consequence.
 */

import { reveal } from '../domForge.js';
import { openWorldServiceSection } from './OpenWorldServiceSection.js';

export function showOpenWorldOverlay(host, snapshot, actions) {
	host.classList.remove('hidden');
	reveal(host, {
		tag: 'section',
		attrs: { class: 'openWorldServicePanel', role: 'dialog', 'aria-modal': 'true' },
		children: [
			overlayHeader(snapshot, actions.onClose),
			...overlayMessage(snapshot.overlay.message),
			openWorldServiceSection(snapshot, actions)
		]
	});
}

export function hideOpenWorldOverlay(host) {
	host.classList.add('hidden');
	host.replaceChildren();
}

function overlayHeader(snapshot, onClose) {
	return {
		tag: 'header',
		children: [
			{
				tag: 'div',
				children: [
					{
						tag: 'span',
						attrs: { class: 'openWorldTag' },
						children: [snapshot.civicTitle]
					},
					{ tag: 'h2', children: [snapshot.overlay.label] },
					{
						tag: 'p',
						children: [`${snapshot.locationName} · ${snapshot.overlay.service}`]
					}
				]
			},
			{
				tag: 'button',
				attrs: { type: 'button', class: 'openWorldClose' },
				on: { click: onClose },
				children: ['Return to Room']
			}
		]
	};
}

function overlayMessage(message) {
	return message
		? [
				{
					tag: 'p',
					attrs: { class: 'openWorldServiceMessage', 'aria-live': 'polite' },
					children: [message]
				}
			]
		: [];
}
