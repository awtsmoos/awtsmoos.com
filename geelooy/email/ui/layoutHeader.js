//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MailWorkspaceHeader
 * @description The Awtsmoos gathers brand, shortcuts, retract controls, advanced settings, and connection state into one calm vessel; Awtsmoos.com keeps every action visible enough to find yet quiet enough that correspondence remains the center line.
 */

/**
 * Reveals the complete workspace-header descriptor consumed by the Mail renderer.
 * @returns {object} Header descriptor with brand, shortcuts, and bounded actions.
 */
export function workspaceHeader() {
	return {
		tag: 'header',
		classList: ['mail-civilization-status'],
		children: [brandDescriptor(), shortcutDescriptor(), statusActionsDescriptor()]
	};
}

/** Returns the home-linked Mail brand vessel. */
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

/** Returns discoverable desktop keyboard hints without making them part of mobile chrome. */
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

/** Returns the compact right-side action cluster in stable priority order. */
function statusActionsDescriptor() {
	return {
		tag: 'div',
		classList: ['mail-status-actions'],
		children: [
			sidebarToggleDescriptor(),
			settingsToggleDescriptor(),
			connectionDescriptor()
		]
	};
}

/** Returns the retract control for the conversation-list pane. */
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

/** Returns the advanced-settings disclosure without exposing advanced controls in the default workspace. */
function settingsToggleDescriptor() {
	return {
		tag: 'button',
		shaym: 'mailSettingsToggle',
		classList: ['mail-settings-toggle-button'],
		attributes: {
			type: 'button',
			'aria-controls': 'mail-settings-drawer',
			'aria-expanded': 'false',
			'aria-label': 'Open Mail settings',
			title: 'Mail settings'
		},
		children: [
			{ tag: 'span', classList: ['mail-settings-toggle-glyph'], attributes: { 'aria-hidden': 'true' }, textContent: '⚙' }
		]
	};
}

/** Returns the local live connectivity status used by MailWorkspaceUx. */
function connectionDescriptor() {
	return {
		tag: 'span',
		classList: ['mail-connection-state'],
		shaym: 'mailConnectionState',
		attributes: {
			role: 'status',
			'aria-live': 'polite',
			'data-mail-connection': ''
		},
		textContent: navigator.onLine ? 'Online' : 'Offline'
	};
}
