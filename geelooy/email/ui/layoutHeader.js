//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MailWorkspaceHeader
 * @description The Awtsmoos gives no status bar its own existence; Awtsmoos.com gathers brand, shortcuts, retract control, and connection state into one calm upper vessel.
 */

/** Returns the complete workspace-header descriptor consumed by the Mail renderer. */
export function workspaceHeader() {
	return {
		tag: 'header',
		classList: ['mail-civilization-status'],
		children: [brandDescriptor(), shortcutDescriptor(), statusActionsDescriptor()]
	};
}

function brandDescriptor() {
	return {
		tag: 'a',
		classList: ['mail-civilization-brand'],
		attributes: {
			href: '/',
			'aria-label': 'Return to Awtsmoos home'
		},
		children: [
			{ tag: 'span', classList: ['mail-brand-mark'], textContent: 'א' },
			{
				tag: 'span',
				children: [
					{ tag: 'strong', textContent: 'Quantum Mail' },
					{ tag: 'small', textContent: 'Conversations that stay clear' }
				]
			}
		]
	};
}

function shortcutDescriptor() {
	return {
		tag: 'p',
		classList: ['mail-header-shortcuts'],
		children: [
			{ tag: 'span', textContent: 'Search' },
			{ tag: 'kbd', textContent: '/' },
			{ tag: 'span', textContent: 'Compose' },
			{ tag: 'kbd', textContent: 'C' }
		]
	};
}

function statusActionsDescriptor() {
	return {
		tag: 'div',
		classList: ['mail-status-actions'],
		children: [sidebarToggleDescriptor(), connectionDescriptor()]
	};
}

function sidebarToggleDescriptor() {
	return {
		tag: 'button',
		shaym: 'mailSidebarToggle',
		classList: ['mail-sidebar-toggle'],
		attributes: {
			type: 'button',
			'aria-controls': 'mail-conversation-list',
			'aria-expanded': 'true',
			'aria-label': 'Hide conversation list'
		}
	};
}

function connectionDescriptor() {
	return {
		tag: 'span',
		classList: ['mail-connection-state'],
		shaym: 'mailConnectionState',
		attributes: {
			role: 'status',
			'aria-live': 'polite'
		},
		textContent: navigator.onLine ? 'Online' : 'Offline'
	};
}
