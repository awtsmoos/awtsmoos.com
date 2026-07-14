// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HeichelLayoutExtras
 * @description
 * Mini mail, toast, and bulk-selection vessels remain outside the primary content tree.
 */

import {
	box,
	button
} from './layout-primitives.js';

export function miniMail(actions) {
	return {
		tag: 'aside',
		attr: {
			class: 'mini-mail-panel hidden',
			'aria-label': 'Mini mail'
		},
		ref: 'miniMailPanel',
		children: [
			{
				tag: 'header',
				children: [
					{ tag: 'strong', children: ['✉️ Mini Mail'] },
					button('×', 'Close mini mail', actions.closeMiniMail)
				]
			},
			{
				tag: 'iframe',
				attr: {
					title: 'Awtsmoos Mail',
					src: '/email?embedded=1'
				}
			},
			{
				tag: 'a',
				attr: {
					href: '/email',
					target: '_blank',
					rel: 'noopener'
				},
				children: ['Open full mail']
			}
		]
	};
}

export function toastContainer() {
	return {
		tag: 'div',
		attr: { id: 'toast-container' },
		ref: 'toastContainer'
	};
}

export function bulkBar() {
	return box(
		'hidden-void',
		[
			{ tag: 'span', ref: 'selectionCount' },
			{
				tag: 'button',
				attr: {
					class: 'ritual-btn danger',
					type: 'button'
				},
				ref: 'bulkDeleteBtn',
				children: ['Delete']
			},
			{
				tag: 'button',
				attr: {
					class: 'ritual-btn',
					type: 'button'
				},
				ref: 'exitSelectionBtn',
				children: ['Cancel']
			}
		],
		{
			attr: { id: 'bulk-actions-bar' },
			ref: 'bulkActionsBar'
		}
	);
}
