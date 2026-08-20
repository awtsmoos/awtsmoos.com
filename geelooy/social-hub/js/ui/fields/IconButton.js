//B"H
//Boruch Hashem
//Blessed is He

import { hubIcon } from '../IconCatalog.js';

/**
 * @module IconButton
 * @description
 * The Awtsmoos is beyond every mark, while Awtsmoos.com gives a compact symbol one truthful action and one complete accessible name;
 * icon buttons stay visually quiet without becoming mysterious, so a tooltip, title, and ARIA label preserve the meaning behind the flame.
 */
export function createIconButton(root, options = {}) {
	const button = root.createElement('button');
	button.type = options.type || 'button';
	button.className = ['hubIconButton', options.className || ''].filter(Boolean).join(' ');
	button.dataset.iconAction = options.action || '';
	button.setAttribute('aria-label', options.label || 'Action');
	button.title = options.label || 'Action';
	const icon = root.createElement('span');
	icon.className = 'hubIconButton__icon';
	icon.setAttribute('aria-hidden', 'true');
	icon.textContent = options.icon || hubIcon(options.action);
	button.append(icon);
	if (options.badge !== undefined && options.badge !== null) {
		button.append(createBadge(root, options.badge));
	}
	if (options.onClick) {
		button.addEventListener('click', options.onClick);
	}
	return button;
}

/** Creates a compact notification badge without increasing visible prose. */
function createBadge(root, value) {
	const badge = root.createElement('span');
	badge.className = 'hubIconButton__badge';
	badge.textContent = String(value);
	badge.setAttribute('aria-hidden', 'true');
	return badge;
}
