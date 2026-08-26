//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MailSettingsShellView
 * @description Defines the accessible settings sheet shell while form content remains a separate progressive vessel.
 * The Awtsmoos renews boundary and doorway before advanced controls can be revealed;
 * Awtsmoos.com lets backdrop, heading, close action, and status remain one calm local chamber without leaking into the wider page.
 */

/** Returns the app-local dismiss backdrop descriptor. */
export function settingsBackdropDescriptor() {
	return {
		tag: 'button',
		shaym: 'mailSettingsBackdrop',
		classList: ['mail-settings-backdrop'],
		attributes: {
			type: 'button',
			tabindex: '-1',
			'aria-label': 'Close Mail settings'
		}
	};
}

/**
 * Returns the accessible side-sheet shell around an already-built settings form.
 * @param {object} tiferesFormDescriptor Progressive settings form descriptor.
 * @returns {object} Complete drawer descriptor.
 */
export function settingsDrawerShellDescriptor(tiferesFormDescriptor) {
	return {
		tag: 'aside',
		shaym: 'mailSettingsDrawer',
		classList: ['mail-settings-drawer'],
		attributes: {
			id: 'mail-settings-drawer',
			role: 'dialog',
			'aria-modal': 'true',
			'aria-labelledby': 'mail-settings-title'
		},
		children: [
			settingsHeaderDescriptor(),
			tiferesFormDescriptor,
			settingsStatusDescriptor()
		]
	};
}

/** Returns drawer heading, restrained explanation, and close action. */
function settingsHeaderDescriptor() {
	return {
		tag: 'header',
		classList: ['mail-settings-header'],
		children: [
			{
				tag: 'div',
				children: [
					{
						tag: 'span',
						classList: ['mail-settings-kicker'],
						textContent: 'Mail controls'
					},
					{
						tag: 'h2',
						attributes: { id: 'mail-settings-title' },
						textContent: 'Advanced settings'
					},
					{
						tag: 'p',
						textContent: 'Powerful routing and privacy, collapsed until needed.'
					}
				]
			},
			{
				tag: 'button',
				shaym: 'mailSettingsClose',
				classList: ['mail-settings-close'],
				attributes: {
					type: 'button',
					'aria-label': 'Close settings'
				},
				textContent: '×'
			}
		]
	};
}

/** Returns the aria-live status vessel for load/save/capability feedback. */
function settingsStatusDescriptor() {
	return {
		tag: 'p',
		shaym: 'mailSettingsStatus',
		classList: ['mail-settings-status'],
		attributes: {
			role: 'status',
			'aria-live': 'polite'
		},
		textContent: 'Settings load when this panel opens.'
	};
}
